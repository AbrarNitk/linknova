#[derive(thiserror::Error, Debug)]
pub enum RouteError {
    #[error("JsonSerializeError: {0}")]
    JsonSerializeError(#[from] serde_json::Error),
}
