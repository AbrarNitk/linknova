type CategoryName = String;
type CategoryID = i64;

#[derive(Clone)]
pub struct Ctx {
    pub pg_pool: sqlx::PgPool,
    pub secret: String,
    pub static_dir: std::path::PathBuf,
    pub category_map:
        std::sync::Arc<std::sync::RwLock<std::collections::HashMap<CategoryName, CategoryID>>>,
}
