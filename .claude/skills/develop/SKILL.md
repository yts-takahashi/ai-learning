---
name: develop
description: 機能開発を設計から実装・コミットまで自律的に完結させるオーケストレータースキル。「〇〇を作って」「〇〇機能を追加して」「〇〇ページを実装して」など、機能追加・開発の依頼があれば必ずこのスキルを使う。ユーザーが途中で指示を出さなくても最後まで完走する。
---

## 役割

ユーザーの一言の依頼から、設計・実装・コミットまでを自律的に完結させる。
途中でユーザーに確認を求めず、判断に迷った場合はより保守的な選択をして進む。

## 実行フロー

```
1. DESIGN   — 仕様書を作成
2. IMPLEMENT — ページ・コンポーネントを実装
3. VERIFY   — lint + 型チェックでエラーがないか確認
4. COMMIT   — Conventional Commits 形式でコミット
```

---

## STEP 1: DESIGN（設計）

### 1-1. 現状把握
- `src/app/` 配下のページ構成を確認する
- `src/components/` 配下の既存コンポーネントを確認する
- 再利用できるものがあれば設計に反映する

### 1-2. 仕様書作成
`docs/specs/<feature-name>.md` を作成する：

```markdown
# <機能名> 仕様書

## 概要
## ページ構成
## コンポーネント設計
## 型定義
## 実装タスク
- [ ] ...
```

---

## STEP 2: IMPLEMENT（実装）

仕様書の「実装タスク」を上から順番に実行する。

### 型定義
`src/lib/types/` に TypeScript の型を定義する。

### コンポーネント
`src/components/` 配下に作成する。
- 汎用部品 → `ui/`
- ナビゲーション等 → `layout/`
- 機能固有 → `features/`

コンポーネントのルール：
- Server Components がデフォルト（`"use client"` は最小限）
- props には必ず `interface Props` で型を付ける
- 名前付きエクスポート（`export function Xxx`）を使う
- `any` 型は使わない

### ページ
`src/app/<route>/page.tsx` を作成する。
- Server Components として実装する
- 動的ルートのパラメータ型は `params: Promise<{ id: string }>` 形式

---

## STEP 3: VERIFY（検証）

実装完了後、以下を確認する：

```bash
npm run lint
npx tsc --noEmit
```

エラーがあれば修正してから次のステップへ進む。
Hooks が自動実行しているため、編集のたびにエラーは検出されているはず。

---

## STEP 4: COMMIT（コミット）

commit スキルを使って Conventional Commits 形式でコミットする。
コミットメッセージ例：
- `feat(lessons): 学習一覧ページを追加`
- `feat(ui): LessonCard コンポーネントを追加`

---

## 判断基準（迷ったとき）

| 状況 | 判断 |
|------|------|
| Server か Client か迷う | Server を選ぶ |
| コンポーネントの配置場所 | `features/` に置く |
| 型が複雑で迷う | シンプルな型に分解する |
| ファイル名の命名 | PascalCase（コンポーネント）/ kebab-case（ルート） |
