---
name: page
description: Next.js App Router のページを作成するスキル。「ページを作って」「〇〇ページを追加して」「ルートを追加して」など、新しいURLに対応するページが必要なときに使う。docs/specs/ に仕様書があればそれを参照して実装する。
---

## 役割

Next.js App Router の規約に従ってページファイルを作成する。

## 規約

### ファイル配置
```
src/app/
  <route>/
    page.tsx      # ページ本体（必須）
    layout.tsx    # このルート以下の共通レイアウト（必要な場合）
    loading.tsx   # ローディング表示（必要な場合）
    error.tsx     # エラー表示（必要な場合、"use client" 必須）
```

### 命名・型
- ページコンポーネントはデフォルトエクスポート
- 関数名は `export default function XxxPage()`
- 動的ルートのパラメータ型：
```typescript
type Props = {
  params: Promise<{ id: string }>
}
export default async function XxxPage({ params }: Props) {
  const { id } = await params
}
```

### Server Components 優先
- `async/await` で直接データ取得する
- ブラウザイベントが必要な場合のみ子コンポーネントに `"use client"` を付ける

### やってはいけないこと
- `"use client"` をページ最上位に付ける（Server Componentsの利点を失う）
- `useEffect` でデータフェッチする
- `any` 型を使う

## 手順

1. `docs/specs/` に仕様書があれば読む
2. 既存の類似ページを参考に構造を合わせる
3. ページファイルを作成
4. 必要なコンポーネントは component スキルで別途作成するか、シンプルなものはインラインで書く
5. Hooks が lint + 型チェックを自動実行するのでエラーがあれば修正する
