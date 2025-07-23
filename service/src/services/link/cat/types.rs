#[derive(thiserror::Error, Debug)]
pub enum CatError {
    #[error("CreateError")]
    CreateError,
}
