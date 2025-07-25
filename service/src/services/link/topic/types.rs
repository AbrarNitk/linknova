#[derive(thiserror::Error, Debug)]
pub enum TopicError {
    #[error("DatabaseError: {0}")]
    Database(#[from] sqlx::Error),
    #[error("NotFoundError: {0}")]
    NotFound(String),
}
