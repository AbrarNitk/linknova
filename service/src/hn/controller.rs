use crate::{error, success};
use axum::extract::Path;
use axum::response::IntoResponse;

pub async fn get_item(Path(id): Path<i64>) -> axum::response::Response {
    match crate::hn::apis::get_item(id).await {
        Ok(r) => success(axum::http::StatusCode::OK, r),
        Err(e) => error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn get_user() -> axum::response::Response {
    (axum::http::StatusCode::OK, "get_user".to_string()).into_response()
}

pub async fn top_stories() -> axum::response::Response {
    match crate::hn::apis::top_stories().await {
        Ok(r) => success(axum::http::StatusCode::OK, r),
        Err(e) => error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}

pub async fn ask_stories() -> axum::response::Response {
    match crate::hn::apis::ask_stories().await {
        Ok(r) => success(axum::http::StatusCode::OK, r),
        Err(e) => error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
    }
}
