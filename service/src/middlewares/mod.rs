mod api;
mod user;

#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("UnAuthorizedError")]
    UnAuthorized,
    #[error("InvalidSecretsError")]
    InvalidSecrets,
    #[error("ExpectedUserError")]
    UserNotExists,
    #[error("UserDecodeError")]
    UserDecodeError(String),
}
