---
name: integration-test
description: フロントエンド（Next.js）とバックエンド（Rust/Axum）が実際に連携して正しく動くことを結合テストで確認するスキル。「結合テストして」「フロントとバックの連携を確認して」「integration-testして」など。develop スキルの最後に自動呼び出されることもある。
---

## 役割

フロントエンドとバックエンドの両サーバーを起動し、実際のHTTPリクエストを通じて
エンドポイントの動作・UIとAPIの連携・エラーハンドリングが正しく機能していることを確認する。

---

## STEP 1: サーバー起動確認

### バックエンド（port 8080）

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null || echo "down"
```

- `200` → 起動済み
- それ以外 → バックグラウンドで起動する：

```bash
cd backend && cargo run &
sleep 5
```

### フロントエンド（port 3000）

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "down"
```

- `200` → 起動済み
- それ以外 → バックグラウンドで起動する：

```bash
npm run dev &
sleep 5
```

両方が起動していることを確認してから次のステップへ進む。

---

## STEP 2: APIエンドポイントテスト（curl）

実装されたエンドポイントを `/tmp/api-spec.md` から読み取り、
`curl` で実際にリクエストを送って動作を検証する。

### テストパターン

#### 認証なしエンドポイント（例: 登録・ログイン）

```bash
# 正常系: ユーザー登録
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq .

# 異常系: 重複登録
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq .

# 正常系: ログイン
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')
echo "Token: $TOKEN"
```

#### 認証ありエンドポイント（例: 進捗）

```bash
# 正常系: 進捗取得
curl -s http://localhost:8080/api/progress \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# 正常系: 完了マーク
curl -s -X POST http://localhost:8080/api/progress/what-is-generative-ai \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# 異常系: 認証なしでアクセス
curl -s http://localhost:8080/api/progress \
  | jq .
# → {"error":"Unauthorized"} が返ることを確認
```

### 確認基準

| チェック項目 | 期待値 |
|-------------|--------|
| 正常系のHTTPステータス | 200 or 201 |
| 正常系のレスポンス型 | API仕様書と一致 |
| 認証エラー | 401 + `{"error":"..."}` |
| バリデーションエラー | 400 + `{"error":"..."}` |
| 存在しないリソース | 404 + `{"error":"..."}` |

---

## STEP 3: フロントエンド結合確認（Playwright MCP）

Playwright MCP を使い、UIから実際にAPIを叩いて動作を確認する。

### 3-1. 認証フロー

```
browser_navigate → http://localhost:3000/login（または登録ページ）
browser_snapshot → ページ構造確認
browser_fill_form → メールアドレス・パスワードを入力
browser_click → 送信ボタン
browser_wait_for → ログイン後のリダイレクト完了を待つ
browser_snapshot → ログイン後のページ確認
```

確認ポイント：
- ログイン後に正しいページへリダイレクトされるか
- JWTトークンが保存されているか（cookie または localStorage）
- エラー時にエラーメッセージが表示されるか

### 3-2. データの読み書きフロー

実装された機能に応じて以下を確認する：

```
# 例: 進捗管理の結合テスト
browser_navigate → http://localhost:3000/lessons/what-is-generative-ai
browser_snapshot → レッスンページ表示確認
browser_click → 「完了にする」ボタン
browser_wait_for → UIの更新を待つ
browser_snapshot → 完了状態に変わったか確認

browser_navigate → http://localhost:3000/dashboard
browser_snapshot → ダッシュボードに完了済みレッスンが反映されているか確認
```

### 3-3. ネットワークリクエスト確認

```
browser_network_requests → APIリクエストが正しく飛んでいるか確認
```

確認ポイント：
- フロントエンドが正しいエンドポイントを呼び出しているか
- リクエストヘッダー（Authorization等）が正しいか
- レスポンスステータスが200系か

---

## STEP 4: エラーハンドリング確認

### ネットワークエラー時のUI

バックエンドを止めてからUIの動作を確認する（オプション）：

```bash
# バックエンドを停止（テスト後に再起動する）
kill $(lsof -ti:8080) 2>/dev/null
```

```
browser_navigate → データ取得が必要なページ
browser_snapshot → エラー状態のUIが表示されるか確認
```

テスト後にバックエンドを再起動する。

---

## STEP 5: テスト結果レポート

以下の形式で結果を出力する：

```
## 結合テスト結果

### API テスト
| エンドポイント | テスト内容 | 結果 |
|--------------|-----------|------|
| POST /api/auth/register | 正常登録 | ✅ |
| POST /api/auth/login | 正常ログイン | ✅ |
| GET /api/progress | 認証あり取得 | ✅ |
| GET /api/progress | 認証なしアクセス | ✅ (401返却) |

### フロントエンド結合テスト
| シナリオ | 結果 | 備考 |
|---------|------|------|
| ログインフロー | ✅ | リダイレクト正常 |
| 進捗完了操作 | ✅ | UIに即時反映 |
| ダッシュボード反映 | ✅ | |

### ❌ 失敗したテスト
（失敗がなければ「なし」と記載）

### 🔧 対応が必要な問題
（問題がなければ「なし」と記載）
```

失敗したテストがある場合は、原因を特定して修正し、再度テストを実行する。

---

## 判断基準

| 状況 | 対応 |
|------|------|
| バックエンドが起動しない | `cargo check` でコンパイルエラーを確認する |
| CORSエラーが出る | `backend/src/main.rs` の `CorsLayer` 設定を確認する |
| 認証トークンが取得できない | ログインレスポンスの構造とフロントの受け取り方を確認する |
| APIは正常だがUIに反映されない | `browser_network_requests` でリクエストが飛んでいるか確認する |
| テスト用データが残る | テスト後に `backend.db` のテストデータを削除する |
