#[derive(thiserror::Error, Debug)]
pub enum TopicError {
    #[error("CreateError")]
    CreateError,
    #[error("DatabaseError: {0}")]
    Database(#[from] sqlx::Error),
}
