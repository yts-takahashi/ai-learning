---
title: "Claude API セットアップ"
chapter: 2
chapterTitle: "API活用"
lessonNumber: 2
slug: "claude-api-setup"
duration: 30
difficulty: "beginner"
hasHandsOn: true
hasQuiz: true
---

## 概要

Claude APIの取得からPython/TypeScript SDKのセットアップ、最初の動作確認まで手を動かしながら学びます。本番環境で使える設定パターンも合わせて習得します。

## 本文

### APIキーの取得

1. [console.anthropic.com](https://console.anthropic.com) にアクセス
2. アカウント作成・ログイン
3. 「API Keys」メニューから新規キーを作成
4. `sk-ant-` で始まるキーをコピーして安全な場所に保存

### SDKのインストール

#### Python

```bash
pip install anthropic
# または
poetry add anthropic
```

#### TypeScript/Node.js

```bash
npm install @anthropic-ai/sdk
# または
yarn add @anthropic-ai/sdk
```

### 環境変数の設定

```bash
# .env ファイル
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx

# または直接エクスポート（開発時）
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
```

**Pythonでの読み込み：**

```python
from dotenv import load_dotenv
import os

load_dotenv()  # .envを自動読み込み
api_key = os.environ["ANTHROPIC_API_KEY"]  # 未設定時はKeyError
```

### クライアントの初期化

```python
import anthropic

# 最もシンプル（環境変数ANTHROPIC_API_KEYを自動読み込み）
client = anthropic.Anthropic()

# 明示的にキーを指定
client = anthropic.Anthropic(api_key="sk-ant-...")

# タイムアウト設定（本番向け）
client = anthropic.Anthropic(
    timeout=30.0,  # 秒
    max_retries=2
)
```

### 利用可能なモデル

| モデル | 用途 | 特徴 |
|--------|------|------|
| claude-opus-4-5 | 高品質タスク | 最高品質・高コスト |
| claude-sonnet-4-5 | バランス | 品質・コストのバランス |
| claude-haiku-3-5 | 高速・低コスト | 大量処理・シンプルタスク |

### 動作確認

```python
import anthropic

def health_check() -> bool:
    """APIの疎通確認"""
    try:
        client = anthropic.Anthropic()
        message = client.messages.create(
            model="claude-haiku-3-5",  # 最速・最安のモデルで確認
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )
        return message.content[0].text != ""
    except anthropic.AuthenticationError:
        print("APIキーが無効です")
        return False
    except anthropic.APIConnectionError:
        print("ネットワーク接続に問題があります")
        return False

if health_check():
    print("API接続OK")
```

## ハンズオン

Python・TypeScript両方の基本実装を作ります。

### Python実装

```python
# claude_client.py
import os
import anthropic
from typing import Optional

def create_client(
    api_key: Optional[str] = None,
    timeout: float = 60.0,
    max_retries: int = 2
) -> anthropic.Anthropic:
    """設定済みClaudeクライアントを生成"""
    return anthropic.Anthropic(
        api_key=api_key or os.environ["ANTHROPIC_API_KEY"],
        timeout=timeout,
        max_retries=max_retries,
    )

def ask(
    prompt: str,
    model: str = "claude-opus-4-5",
    max_tokens: int = 1024,
    system: Optional[str] = None
) -> str:
    client = create_client()

    kwargs = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        kwargs["system"] = system

    message = client.messages.create(**kwargs)
    return message.content[0].text


if __name__ == "__main__":
    response = ask(
        "Pythonのasync/awaitを一言で説明してください",
        system="あなたはPythonの専門家です。簡潔に答えてください。"
    )
    print(response)
```

### TypeScript実装

```typescript
// claude-client.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function ask(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    system?: string;
  }
): Promise<string> {
  const { model = "claude-opus-4-5", maxTokens = 1024, system } = options ?? {};

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    ...(system && { system }),
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected content type");
  return content.text;
}

// 動作確認
(async () => {
  const result = await ask("TypeScriptの型推論を一言で説明してください");
  console.log(result);
})();
```

### 完成コード（設定管理付き）

```python
import os
import anthropic
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ClaudeConfig:
    """Claude APIクライアントの設定"""
    api_key: str = ""
    default_model: str = "claude-opus-4-5"
    default_max_tokens: int = 1024
    timeout: float = 60.0
    max_retries: int = 2

    def __post_init__(self):
        if not self.api_key:
            self.api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY が設定されていません")


class ClaudeClient:
    def __init__(self, config: Optional[ClaudeConfig] = None):
        self.config = config or ClaudeConfig()
        self._client = anthropic.Anthropic(
            api_key=self.config.api_key,
            timeout=self.config.timeout,
            max_retries=self.config.max_retries,
        )

    def ask(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        system: Optional[str] = None,
    ) -> str:
        kwargs = {
            "model": model or self.config.default_model,
            "max_tokens": max_tokens or self.config.default_max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system

        msg = self._client.messages.create(**kwargs)
        return msg.content[0].text

    def health_check(self) -> bool:
        try:
            return bool(self.ask("Hi", model="claude-haiku-3-5", max_tokens=5))
        except Exception:
            return False


if __name__ == "__main__":
    claude = ClaudeClient()
    if claude.health_check():
        print("API接続OK")
        print(claude.ask("Pythonのf-stringを一言で説明してください"))
```

## クイズ

<!-- QUIZ:START -->
**Q1. Anthropic Python SDKでAPIキーを設定する最も安全な方法はどれですか？**

- A) コードに直接記述する
- B) 環境変数`ANTHROPIC_API_KEY`を設定してSDKに自動読み込みさせる
- C) コマンドライン引数で渡す
- D) ログファイルに記録する

**正解: B**
**解説:** 環境変数`ANTHROPIC_API_KEY`を設定すると、`anthropic.Anthropic()`のインスタンス化時に自動的に読み込まれます。これがセキュリティ的に最も安全な方法です。

**Q2. 本番環境向けにClaudeクライアントを初期化する際に設定すべき重要なパラメータはどれですか？**

- A) フォント設定
- B) タイムアウトと最大リトライ回数
- C) 画面解像度
- D) ロケール設定

**正解: B**
**解説:** 本番環境では`timeout`（応答待機時間）と`max_retries`（一時的なエラー時の自動リトライ数）を設定することで、ネットワーク問題やAPIの一時障害に対応できます。

**Q3. 動作確認（ヘルスチェック）に使うべきモデルはどれですか？**

- A) 最も高機能なモデル
- B) 最も安価・高速なモデル（claude-haiku-3-5など）
- C) 最新リリースのモデル
- D) モデルの種類は関係ない

**正解: B**
**解説:** ヘルスチェックは接続確認が目的なので、最も安価・高速なHaikuモデルを使うことでコストとレイテンシを最小化できます。
<!-- QUIZ:END -->

## まとめ

- APIキーは`console.anthropic.com`で取得し、環境変数で管理する
- Python SDKは`pip install anthropic`でインストール
- 本番ではタイムアウトとリトライ数を設定する
- ヘルスチェックは最安モデルで実装してコストを抑える

## 次のレッスン

次のレッスンでは、Messages APIの詳細な使い方（パラメータ・レスポンス処理・エラー分岐）を学び、実践的なAPIラッパーを実装します。
