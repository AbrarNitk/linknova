pub mod apis;
pub mod controller;
pub mod router;

#[derive(thiserror::Error, Debug)]
pub enum HNError {
    #[error("HttpReqwestError: {}", _0)]
    HttpReqwestError(#[from] crate::utils::http::ReqwestError),
}
