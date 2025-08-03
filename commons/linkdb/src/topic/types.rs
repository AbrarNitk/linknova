use sqlx::FromRow;
use sqlx::types::chrono;

#[derive(Debug)]
pub struct TopicRowI {
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub about: Option<String>,
    pub priority: i32,
    pub active: bool,
    pub public: bool,
    pub user_id: String,
}

#[derive(FromRow, Debug)]
pub struct TopicRow {
    pub id: i64,
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub about: Option<String>,
    pub priority: i32,
    pub active: bool,
    pub public: bool,
    pub user_id: String,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
    pub categories: Vec<String>,
}

#[derive(FromRow, Debug)]
pub struct TopicRowView {
    pub id: i64,
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub priority: i32,
    pub active: bool,
    pub public: bool,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
    pub categories: Vec<String>,
}
