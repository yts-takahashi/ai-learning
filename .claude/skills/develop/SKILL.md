---
name: develop
description: フルスタック機能開発を設計から実装・コミットまで自律的に完結させるオーケストレータースキル。「〇〇を作って」「〇〇機能を追加して」「〇〇ページを実装して」「ログイン機能を追加して」など、機能追加・開発の依頼があれば必ずこのスキルを使う。API仕様を決定し、frontend-developer と api-developer を並列起動して効率よく開発する。ユーザーが途中で指示を出さなくても最後まで完走する。
---

## 役割

ユーザーの一言の依頼から、API仕様の決定・フロントエンド/バックエンドへの並列委譲・統合確認・コミットまでを自律的に完結させる。

フロントエンドのみの変更（UIの微調整等）であれば `frontend-developer` だけを呼び出し、バックエンドのみであれば `api-developer` だけを呼び出す。フルスタックな機能追加では両者を並列で起動する。

---

## 実行フロー

```
1. ANALYZE          — 要件分析・スコープ判定
2. SPEC             — API仕様の決定（フルスタックの場合）
3. IMPLEMENT        — frontend-developer / api-developer を並列起動
4. VERIFY           — 型・lint チェック
5. INTEGRATION-TEST — フロントとバックの結合確認（フルスタックの場合）
6. COMMIT           — コミット
```

---

## STEP 1: ANALYZE（要件分析）

### 1-1. 現状把握
- `src/app/` 配下のページ構成を確認する
- `src/components/` 配下の既存コンポーネントを確認する
- `backend/` が存在するか確認する
- `docs/specs/` に関連仕様書があれば読む

### 1-2. スコープ判定

| 変更内容 | 起動するサブエージェント |
|----------|----------------------|
| UIのみ（表示・スタイル等） | `frontend-developer` のみ |
| APIのみ（新しいエンドポイント等） | `api-developer` のみ |
| フルスタック（新機能追加等） | `frontend-developer` + `api-developer` を並列 |

---

## STEP 2: SPEC（API仕様決定）

フルスタックな機能追加の場合のみ実行する。

### 2-1. API仕様の決定

以下の観点でAPIエンドポイントを設計する：
- **何のリソースを操作するか**（users, progress, lessons 等）
- **どんな操作か**（CRUD）
- **誰が呼び出すか**（認証が必要か）
- **何を送って何が返るか**（リクエスト/レスポンスの型）

### 2-2. API仕様書の作成

`/tmp/api-spec.md` に書き出す：

```markdown
# API仕様: <機能名>

## エンドポイント一覧

### POST /api/auth/login
**説明**: ユーザーログイン
**認証**: 不要
**リクエスト**:
\```json
{ "email": "string", "password": "string" }
\```
**レスポンス (200)**:
\```json
{ "token": "string", "user": { "id": "string", "email": "string" } }
\```
**エラー (401)**: `{ "error": "Invalid credentials" }`

---

### GET /api/progress
**説明**: ログインユーザーの進捗取得
**認証**: Bearer token 必要
**レスポンス (200)**:
\```json
{ "completedSlugs": ["string"], "lastUpdated": "string" }
\```
```

### 2-3. フロントエンド要件の整理

UIで必要なものを整理する：
- 追加・変更するページ
- 追加・変更するコンポーネント
- 呼び出すAPIエンドポイント
- 状態管理の方針（Server Component での fetch か、Client での状態管理か）

---

## STEP 3: IMPLEMENT（並列実装）

### フルスタックの場合（並列起動）

**frontend-developer** と **api-developer** を同時に起動する。

**frontend-developer へ渡す情報**:
```
以下の仕様で実装してください：

[API仕様書の内容をそのまま貼る]

## フロントエンド要件
- 実装するページ: ...
- 実装するコンポーネント: ...
- API呼び出し方針: ...
```

**api-developer へ渡す情報**:
```
以下の仕様で実装してください：

[API仕様書の内容をそのまま貼る]

## バックエンド要件
- 実装するエンドポイント: ...
- 認証: ...
- DBスキーマ変更: ...
```

### フロントエンドのみの場合

`frontend-developer` スキルを起動し、要件を渡す。

### バックエンドのみの場合

`api-developer` スキルを起動し、API仕様を渡す。

---

## STEP 4: VERIFY（検証）

実装完了後、以下を確認する：

```bash
# フロントエンド
npm run lint
npx tsc --noEmit

# バックエンド（backend/ が存在する場合）
cd backend && cargo check && cargo clippy
```

エラーがあれば修正してから次のステップへ進む。

---

## STEP 5: INTEGRATION-TEST（結合テスト）

フルスタックな実装の場合（フロントエンドとバックエンドの両方を変更した場合）のみ実行する。

`integration-test` スキルを起動する：

```
.claude/skills/integration-test/SKILL.md を読み、結合テストを実行してください。
テスト対象のAPI仕様は /tmp/api-spec.md を参照してください。
```

テストで失敗が発生した場合は、原因を修正してから再度テストを実行する。
すべてのテストが通過したら次のステップへ進む。

---

## STEP 6: COMMIT（コミット）

`commit` スキルを使って Conventional Commits 形式でコミットする。

コミットメッセージ例：
- `feat(auth): ログイン・登録機能を追加`
- `feat(progress): 進捗をサーバーサイドで管理するように変更`
- `feat(ui): ログインフォームコンポーネントを追加`

---

## 判断基準（迷ったとき）

| 状況 | 判断 |
|------|------|
| フロントのみかフルスタックか迷う | バックエンドAPIが必要なら必ずフルスタック |
| APIの認証が必要か迷う | ユーザー固有データを扱うなら認証必須 |
| DB設計が迷う | シンプルに始めてマイグレーションで拡張 |
| 型の整合性（TS ↔ Rust） | API仕様書のJSON型を双方の実装のソースオブトゥルースにする |
| フェーズが多くなりすぎる | まず動くものを作り、後でリファクタリング |
