#[derive(thiserror::Error, Debug)]
pub enum CatError {
    #[error("DatabaseError: {0}")]
    Database(#[from] sqlx::Error),
    #[error("NotFoundError: {0}")]
    NotFound(String),
}
