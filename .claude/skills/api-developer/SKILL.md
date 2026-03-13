---
name: api-developer
description: Rust + Axum + SQLite(SQLx) によるバックエンドAPI開発の専門家スキル。「APIを実装して」「エンドポイントを作って」「Rustバックエンドを」「バックエンドを実装して」など、Rustバックエンド・REST API開発の依頼があれば使う。developスキルのサブエージェントとして並列で呼び出されることもある。
---

## 役割

`develop` から渡されたAPI仕様、またはユーザーの依頼をもとに、Rust + Axum + SQLite(SQLx) でバックエンドAPIを実装する。

## 受け取る情報

呼び出し時に以下が渡される（`develop` 経由の場合）：
- API仕様書（エンドポイント一覧・リクエスト/レスポンス型）
- 実装すべきエンドポイントのスコープ

単独で呼ばれた場合は、ユーザーの依頼から自分で仕様を読み取る。

---

## ファイル配置規約

```
backend/
  src/
    main.rs          # サーバー起動・ルート登録
    routes/
      mod.rs         # ルーター定義（Router の組み立て）
    handlers/
      mod.rs
      <resource>.rs  # エンドポイントハンドラ
    models/
      mod.rs
      <resource>.rs  # DBモデル・クエリ
    errors.rs        # アプリケーションエラー型
    state.rs         # AppState（DB接続等）
  migrations/
    YYYYMMDDHHMMSS_<name>.sql  # SQLマイグレーション
  Cargo.toml
  .env.example       # 環境変数のサンプル
```

---

## 実行フロー

### STEP 1: 現状確認

- `backend/` ディレクトリが存在するか確認する
- `Cargo.toml` が存在すれば依存クレートを確認する
- 既存のハンドラ・モデルと重複しないか確認する

### STEP 2: Cargo.toml の確認・更新

必要な依存クレートを追加する：

```toml
[dependencies]
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.8", features = ["sqlite", "runtime-tokio-rustls", "migrate", "chrono"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "1"
anyhow = "1"
tower-http = { version = "0.5", features = ["cors"] }
dotenvy = "0.15"
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["v4", "serde"] }
# 認証が必要な場合
jsonwebtoken = "9"
bcrypt = "0.15"
```

### STEP 3: エラー型定義（errors.rs）

```rust
use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".into()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Database error".into()),
            AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal error".into()),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### STEP 4: マイグレーション作成

`migrations/` にSQLファイルを作成する。ファイル名は `YYYYMMDDHHMMSS_<name>.sql` 形式。

```sql
-- 例: users テーブル
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 例: progress テーブル
CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, lesson_slug)
);
```

### STEP 5: モデル実装（models/）

```rust
// models/user.rs の例
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: chrono::NaiveDateTime,
}
```

### STEP 6: ハンドラ実装（handlers/）

```rust
// handlers/progress.rs の例
use axum::{extract::{Path, State}, Json};
use crate::{errors::Result, state::AppState};

pub async fn get_progress(
    State(state): State<AppState>,
    // 認証が必要なら: Extension(user): Extension<User>,
) -> Result<Json<Vec<String>>> {
    // DB クエリを実装
    todo!()
}
```

### STEP 7: ルート定義（routes/mod.rs）

```rust
use axum::{Router, routing::{get, post, delete}};
use crate::{handlers, state::AppState};

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/api/progress", get(handlers::progress::get_progress))
        .route("/api/progress/:slug", post(handlers::progress::mark_complete))
        .route("/api/progress/:slug", delete(handlers::progress::mark_incomplete))
        .with_state(state)
}
```

### STEP 8: main.rs

```rust
use axum::Router;
use sqlx::sqlite::SqlitePoolOptions;
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let db_url = std::env::var("DATABASE_URL").unwrap_or("sqlite:backend.db".into());

    let pool = SqlitePoolOptions::new()
        .connect(&db_url).await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = AppState { db: pool };
    let app = routes::create_router(state)
        .layer(CorsLayer::new().allow_origin(Any));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    println!("Backend listening on http://localhost:8080");
    axum::serve(listener, app).await?;
    Ok(())
}
```

### STEP 9: 動作確認

```bash
cd backend
cargo check          # コンパイルエラー確認
cargo clippy         # lintチェック
```

### STEP 10: 実装完了報告

以下を報告する：
- 実装したエンドポイント一覧
- 作成・変更したファイル一覧
- フロントエンドから呼び出す際の注意点（CORS設定、認証ヘッダー等）

---

## 判断基準（迷ったとき）

| 状況 | 判断 |
|------|------|
| 認証が必要かどうか | API仕様書に従う。不明なら不要で実装 |
| エラー型の粒度 | `AppError` で統一し、追加が必要なら variant を追加 |
| DB設計 | SQLite で始め、後からPostgresに移行できる設計 |
| 型の命名 | モデル名は PascalCase、テーブル名は snake_case |
| 非同期処理 | tokio で統一、`async/await` を使う |
