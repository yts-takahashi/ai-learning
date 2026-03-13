use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Progress {
    pub id: String,
    pub user_id: String,
    pub lesson_slug: String,
    pub completed_at: NaiveDateTime,
}
