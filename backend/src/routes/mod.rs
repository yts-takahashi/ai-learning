use axum::{
    routing::{get, post},
    Router,
};

use crate::{handlers, state::AppState};

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(handlers::health::health))
        .route("/api/auth/register", post(handlers::auth::register))
        .route("/api/auth/login", post(handlers::auth::login))
        .route("/api/progress", get(handlers::progress::get_progress))
        .route(
            "/api/progress/:slug",
            post(handlers::progress::mark_complete)
                .delete(handlers::progress::mark_incomplete),
        )
        .with_state(state)
}
