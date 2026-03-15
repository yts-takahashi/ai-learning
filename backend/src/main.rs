mod auth;
mod errors;
mod handlers;
mod models;
mod routes;
mod state;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use std::str::FromStr;
use tower_http::cors::{AllowOrigin, CorsLayer};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    // DATABASE_URL が相対パス (sqlite:*.db) の場合、実行バイナリのディレクトリを基準にする
    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        let exe_dir = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.to_path_buf()))
            .unwrap_or_else(|| std::path::PathBuf::from("."));
        // cargo run 時は target/debug/ 配下になるので、プロジェクトルートを遡る
        let project_root = exe_dir
            .ancestors()
            .find(|p| p.join("Cargo.toml").exists())
            .map(|p| p.to_path_buf())
            .unwrap_or(exe_dir);
        // 絶対パスの場合 sqlite:// + /absolute/path = sqlite:///absolute/path (3スラッシュ)
        format!("sqlite://{}", project_root.join("backend.db").display())
    });
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string());
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "dev-secret-change-in-production".to_string());

    let connect_opts = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_opts)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let app_state = state::AppState {
        db: pool,
        jwt_secret,
    };

    let allowed_origin = std::env::var("ALLOWED_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::exact(
            allowed_origin.parse().expect("Invalid ALLOWED_ORIGIN"),
        ))
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ]);

    let app = routes::create_router(app_state).layer(cors);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    println!("Backend listening on http://localhost:{}", port);
    axum::serve(listener, app).await?;

    Ok(())
}
