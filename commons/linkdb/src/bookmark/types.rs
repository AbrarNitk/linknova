use sqlx::types::chrono;

#[derive(Debug)]
pub struct BookmarkI {
    pub url: String,
    pub user_id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub referrer: Option<String>,
    pub status: String,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct BookmarkRow {
    pub id: i64,
    pub url: String,
    pub user_id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub referrer: Option<String>,
    pub status: String,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
    pub categories: Vec<String>,
}
