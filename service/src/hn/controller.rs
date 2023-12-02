use axum::response::IntoResponse;

pub async fn get_item() -> axum::response::Response {
    (axum::http::StatusCode::OK, "get_item".to_string()).into_response()
}

pub async fn get_user() -> axum::response::Response {
    (axum::http::StatusCode::OK, "get_user".to_string()).into_response()
}

pub async fn top_stories() -> axum::response::Response {
    (axum::http::StatusCode::OK, "top_stories".to_string()).into_response()
}

pub async fn ask_stories() -> axum::response::Response {
    (axum::http::StatusCode::OK, "ask_stories".to_string()).into_response()
}
