use sqlx::FromRow;
use sqlx::types::chrono;

#[derive(Debug)]
pub struct CatRowI {
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub about: Option<String>,
    pub priority: i32,
    pub active: bool,
    pub public: bool,
    pub user_id: String,
}

#[derive(Debug, FromRow)]
pub struct CatRow {
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
}

#[derive(FromRow, Debug)]
pub struct CategoryRowView {
    pub id: i64,
    pub name: String,
    pub display_name: Option<String>,
    pub description: Option<String>,
    pub priority: i32,
    pub active: bool,
    pub public: bool,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
}
