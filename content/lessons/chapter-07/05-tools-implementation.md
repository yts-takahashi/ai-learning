---
title: "Toolsの実装"
chapter: 7
chapterTitle: "MCP・ツール連携"
lessonNumber: 5
slug: "tools-implementation"
duration: 30
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

MCPのTools機能はAIが能動的に呼び出せる関数を提供します。このレッスンでは、Toolsの設計原則・複雑なスキーマ定義・非同期処理・エラーハンドリング・テスト方法を学びます。

## 本文

### Toolsの設計原則

良いMCPツールの設計は、AIが「いつ・どのように使うか」を理解できることが重要です。

```
良いToolの要件:
1. 明確で具体的なname（動詞_名詞形式）
2. AIが理解できるdescription
3. 各パラメータの意味が明確なdescribeアノテーション
4. 適切なバリデーション（型・範囲・必須/任意）
5. 予測可能なレスポンス形式
```

### 複雑なスキーマ定義

```typescript
import { z } from "zod";

// ネストしたオブジェクト
const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).describe("顧客名"),
    email: z.string().email().describe("メールアドレス"),
    address: z.object({
      prefecture: z.string().describe("都道府県"),
      city: z.string().describe("市区町村"),
      street: z.string().describe("番地"),
    }).describe("配送先住所"),
  }).describe("顧客情報"),
  items: z.array(z.object({
    product_id: z.string().describe("商品ID"),
    quantity: z.number().int().positive().describe("数量"),
  })).min(1).describe("注文商品リスト"),
  priority: z.enum(["normal", "express", "urgent"]).default("normal").describe("配送優先度"),
  notes: z.string().optional().describe("配送メモ（任意）"),
});

server.tool(
  "create_order",
  "新しい注文を作成する",
  createOrderSchema.shape,
  async (params) => {
    const { customer, items, priority, notes } = params;
    // 注文処理ロジック
    const orderId = `ORD-${Date.now()}`;
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          orderId,
          customer: customer.name,
          itemCount: items.length,
          priority,
          status: "created",
        }, null, 2),
      }],
    };
  }
);
```

### 非同期処理と長時間実行

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "async-tools", version: "1.0.0" });

// 非同期ファイル処理の例
server.tool(
  "process_csv",
  "CSVファイルを読み込んでデータを集計する",
  {
    file_path: z.string().describe("CSVファイルのパス"),
    column: z.string().describe("集計する列名"),
  },
  async ({ file_path, column }) => {
    const fs = await import("fs/promises");
    const path = await import("path");

    try {
      // ファイルの安全性チェック
      const resolvedPath = path.resolve(file_path);
      const allowedDir = "/app/data";
      if (!resolvedPath.startsWith(allowedDir)) {
        return {
          content: [{ type: "text", text: "エラー: 許可されたディレクトリ外のファイルです" }],
          isError: true,
        };
      }

      const content = await fs.readFile(resolvedPath, "utf-8");
      const lines = content.split("\n").filter(l => l.trim());

      if (lines.length === 0) {
        return { content: [{ type: "text", text: "CSVファイルが空です" }], isError: true };
      }

      const headers = lines[0].split(",").map(h => h.trim());
      const colIndex = headers.indexOf(column);

      if (colIndex === -1) {
        return {
          content: [{ type: "text", text: `列 '${column}' が見つかりません。利用可能な列: ${headers.join(", ")}` }],
          isError: true,
        };
      }

      const values = lines.slice(1)
        .map(line => parseFloat(line.split(",")[colIndex]))
        .filter(v => !isNaN(v));

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            column,
            count: values.length,
            sum: Math.round(sum * 100) / 100,
            average: Math.round(avg * 100) / 100,
            max,
            min,
          }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `エラー: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);
```

### 外部APIを呼ぶツール

```typescript
server.tool(
  "fetch_exchange_rate",
  "為替レートを取得する",
  {
    from_currency: z.string().length(3).toUpperCase().describe("変換元通貨コード（例: USD）"),
    to_currency: z.string().length(3).toUpperCase().describe("変換先通貨コード（例: JPY）"),
    amount: z.number().positive().optional().default(1).describe("変換する金額"),
  },
  async ({ from_currency, to_currency, amount }) => {
    // タイムアウト付きのfetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from_currency}`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          content: [{ type: "text", text: `APIエラー: ${response.status}` }],
          isError: true,
        };
      }

      const data = await response.json() as { rates: Record<string, number> };
      const rate = data.rates[to_currency];

      if (!rate) {
        return {
          content: [{ type: "text", text: `通貨コード '${to_currency}' が見つかりません` }],
          isError: true,
        };
      }

      const converted = amount * rate;
      return {
        content: [{
          type: "text",
          text: `${amount} ${from_currency} = ${converted.toFixed(2)} ${to_currency}\n（レート: 1 ${from_currency} = ${rate} ${to_currency}）`,
        }],
      };
    } catch (error) {
      clearTimeout(timeout);
      if ((error as Error).name === "AbortError") {
        return {
          content: [{ type: "text", text: "エラー: APIリクエストがタイムアウトしました" }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: `エラー: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);
```

### ツールのテスト

```typescript
// src/__tests__/tools.test.ts
import { describe, it, expect } from "vitest";

// ツールハンドラーを直接テスト（サーバーなし）
async function calculateBmi(weight_kg: number, height_cm: number) {
  const height_m = height_cm / 100;
  const bmi = weight_kg / (height_m ** 2);
  const rounded = Math.round(bmi * 10) / 10;

  let category: string;
  if (bmi < 18.5) category = "低体重";
  else if (bmi < 25) category = "普通体重";
  else if (bmi < 30) category = "過体重";
  else category = "肥満";

  return { bmi: rounded, category };
}

describe("BMI計算ツール", () => {
  it("正常なBMIを計算できる", async () => {
    const result = await calculateBmi(70, 175);
    expect(result.bmi).toBe(22.9);
    expect(result.category).toBe("普通体重");
  });

  it("低体重を正しく判定する", async () => {
    const result = await calculateBmi(45, 170);
    expect(result.category).toBe("低体重");
  });

  it("肥満を正しく判定する", async () => {
    const result = await calculateBmi(100, 170);
    expect(result.category).toBe("肥満");
  });
});
```

## ハンズオン

実用的なWebスクレイピングツールを実装してみましょう。

### ステップ1：URLメタデータ取得ツール

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "web-tools", version: "1.0.0" });

server.tool(
  "get_url_metadata",
  "URLのメタデータ（タイトル・説明・OGP情報）を取得する",
  {
    url: z.string().url().describe("取得するURL"),
  },
  async ({ url }) => {
    // セキュリティ: 内部ネットワークへのアクセスを禁止
    const parsed = new URL(url);
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254"];
    if (blockedHosts.some(h => parsed.hostname.includes(h))) {
      return {
        content: [{ type: "text", text: "エラー: 内部ネットワークへのアクセスは禁止されています" }],
        isError: true,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "MCPBot/1.0" },
      });
      clearTimeout(timeout);

      const html = await response.text();

      // 簡易的なメタデータ抽出
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);

      const metadata = {
        url,
        title: ogTitleMatch?.[1] || titleMatch?.[1] || "タイトルなし",
        description: descMatch?.[1] || "説明なし",
        statusCode: response.status,
      };

      return {
        content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }],
      };
    } catch (error) {
      clearTimeout(timeout);
      return {
        content: [{ type: "text", text: `エラー: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Tools MCP Server started!");
}

main().catch(console.error);
```

## クイズ

<!-- QUIZ:START -->
**Q1. MCPツールの `description` フィールドが重要な理由はどれですか？**

- A) APIドキュメントの自動生成に使われる
- B) AIがツールをいつ・どのように使うかを理解するための情報であり、品質が直接精度に影響する
- C) ツールの実行速度を制御する
- D) 認証情報として使われる

**正解: B**
**解説:** MCPツールの `description` はAI（Claude等）がツールを選択するかどうかの判断に直接使われます。曖昧な説明は「このツールをどう使うか」をAIが理解できず、使われなかったり誤用される原因になります。

**Q2. 外部APIを呼ぶツールでタイムアウトを設定する最適な方法はどれですか？**

- A) setTimeout()で一定時間後にプロセスを強制終了する
- B) AbortControllerとsignal引数をfetchに渡してタイムアウトを制御する
- C) Promise.race()でタイムアウト用のPromiseと競合させる
- D) タイムアウトは不要

**正解: B**
**解説:** `AbortController` を使って `fetch` にシグナルを渡すのが最も標準的な方法です。タイムアウト時は `AbortError` が発生するため、これをキャッチして適切なエラーレスポンスを返します。

**Q3. MCPツールが外部ネットワークにアクセスする際、最初にチェックすべきセキュリティ対策はどれですか？**

- A) HTTPSかどうかの確認
- B) URLの長さのチェック
- C) localhost・内部IPレンジ・クラウドメタデータエンドポイントへのアクセスのブロック
- D) コンテンツタイプの確認

**正解: C**
**解説:** SSRF（Server Side Request Forgery）攻撃を防ぐため、外部URLにアクセスするツールでは localhost・127.0.0.1・192.168.x.x・169.254.169.254（AWSメタデータ）などの内部アドレスへのアクセスをブロックする必要があります。
<!-- QUIZ:END -->

## まとめ

- ツール名は`動詞_名詞`形式にし、`description`はAIが理解できる具体的な説明にする
- zodで入力スキーマを定義することで型安全なバリデーションが自動的に機能する
- 外部API呼び出しには必ずタイムアウトとエラーハンドリングを実装する
- ツールのハンドラーロジックは単体テストが書けるよう関数として切り出す

## 次のレッスン

次のレッスンでは、MCPのResources機能（ファイル・DB・APIデータをAIが参照できるリソースとして公開する方法）を学びます。
