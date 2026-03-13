use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    auth::create_token,
    errors::{AppError, Result},
    models::user::User,
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>> {
    if body.email.is_empty() || body.password.is_empty() {
        return Err(AppError::BadRequest("email and password are required".into()));
    }

    // Check if email already exists
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM users WHERE email = ?",
    )
    .bind(&body.email)
    .fetch_one(&state.db)
    .await?;

    if existing > 0 {
        return Err(AppError::Conflict("Email already registered".into()));
    }

    let password_hash = bcrypt::hash(&body.password, bcrypt::DEFAULT_COST)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("bcrypt error: {}", e)))?;

    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
    )
    .bind(&id)
    .bind(&body.email)
    .bind(&password_hash)
    .execute(&state.db)
    .await?;

    let token = create_token(&id, &body.email, &state.jwt_secret)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("jwt error: {}", e)))?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id,
            email: body.email,
        },
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>> {
    if body.email.is_empty() || body.password.is_empty() {
        return Err(AppError::BadRequest("email and password are required".into()));
    }

    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
    )
    .bind(&body.email)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    let valid = bcrypt::verify(&body.password, &user.password_hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("bcrypt error: {}", e)))?;

    if !valid {
        return Err(AppError::Unauthorized);
    }

    let token = create_token(&user.id, &user.email, &state.jwt_secret)
        .map_err(|e| AppError::Internal(anyhow::anyhow!("jwt error: {}", e)))?;

    Ok(Json(AuthResponse {
        token,
        user: UserResponse {
            id: user.id,
            email: user.email,
        },
    }))
}
