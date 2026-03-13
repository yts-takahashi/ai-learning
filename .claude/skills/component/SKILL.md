---
name: component
description: React コンポーネントを作成するスキル。「コンポーネントを作って」「〇〇カードを作って」「ナビゲーションを追加して」など、UIの部品が必要なときに使う。docs/specs/ に仕様書があればそれを参照する。
---

## 役割

プロジェクト規約に従った再利用可能な React コンポーネントを作成する。

## 配置ルール

```
src/components/
  ui/         # ボタン・カード・バッジなど汎用の最小単位
  layout/     # ヘッダー・フッター・ナビゲーション・サイドバー
  features/   # 特定機能に紐づくコンポーネント（LessonCard など）
```

迷ったら `features/` に置く。複数の機能で使い回すと分かったら `ui/` に移動する。

## 命名規則

| 対象 | 規則 | 例 |
|------|------|----|
| コンポーネントファイル | PascalCase | `LessonCard.tsx` |
| コンポーネント関数 | PascalCase | `export function LessonCard()` |
| props インターフェース | `Props` | `interface Props { ... }` |
| フック | use + camelCase | `useLessons.ts` |

## コンポーネントのテンプレート

### Server Component（デフォルト）
```typescript
interface Props {
  // props の型定義
}

export function ComponentName({ }: Props) {
  return (
    <div>
    </div>
  )
}
```

### Client Component（インタラクションが必要な場合のみ）
```typescript
"use client"

import { useState } from "react"

interface Props {
  // props の型定義
}

export function ComponentName({ }: Props) {
  const [state, setState] = useState(...)

  return (
    <div>
    </div>
  )
}
```

## やってはいけないこと

- `any` 型の使用（型推論できない場合は `unknown`）
- `"use client"` を不必要に付ける
- props に型を付けない
- デフォルトエクスポートを使う（名前付きエクスポートを使う）

## 手順

1. `docs/specs/` に仕様書があれば読む
2. `src/components/` 配下に既存の類似コンポーネントがあれば参考にする
3. 配置先（`ui/` `layout/` `features/`）を判断して作成
4. Hooks が lint + 型チェックを自動実行するのでエラーがあれば修正する
