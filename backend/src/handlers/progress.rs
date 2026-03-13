use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::Serialize;
use uuid::Uuid;

use crate::{
    auth::AuthUser,
    errors::{AppError, Result},
    models::progress::Progress,
    state::AppState,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProgressListResponse {
    pub completed_slugs: Vec<String>,
    pub last_updated: String,
}

pub async fn get_progress(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
) -> Result<Json<ProgressListResponse>> {
    let records = sqlx::query_as::<_, Progress>(
        "SELECT id, user_id, lesson_slug, completed_at FROM progress WHERE user_id = ? ORDER BY completed_at ASC",
    )
    .bind(&claims.sub)
    .fetch_all(&state.db)
    .await?;

    let last_updated = records
        .last()
        .map(|p| p.completed_at.format("%Y-%m-%dT%H:%M:%SZ").to_string())
        .unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%dT%H:%M:%SZ").to_string());

    let completed_slugs = records.into_iter().map(|p| p.lesson_slug).collect();

    Ok(Json(ProgressListResponse { completed_slugs, last_updated }))
}

pub async fn mark_complete(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode> {
    let id = Uuid::new_v4().to_string();

    let result = sqlx::query(
        "INSERT OR IGNORE INTO progress (id, user_id, lesson_slug) VALUES (?, ?, ?)",
    )
    .bind(&id)
    .bind(&claims.sub)
    .bind(&slug)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        // Already exists — return 200 OK (idempotent)
        return Ok(StatusCode::OK);
    }

    Ok(StatusCode::CREATED)
}

pub async fn mark_incomplete(
    State(state): State<AppState>,
    AuthUser(claims): AuthUser,
    Path(slug): Path<String>,
) -> Result<StatusCode> {
    let result = sqlx::query(
        "DELETE FROM progress WHERE user_id = ? AND lesson_slug = ?",
    )
    .bind(&claims.sub)
    .bind(&slug)
    .execute(&state.db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!(
            "Progress for lesson '{}' not found",
            slug
        )));
    }

    Ok(StatusCode::NO_CONTENT)
}
