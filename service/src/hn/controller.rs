use axum::response::IntoResponse;

pub async fn get_item() -> axum::response::Response {
    (axum::http::StatusCode::OK, "".to_string()).into_response()
}


pub async fn top_stories() -> axum::response::Response {
    (axum::http::StatusCode::OK, "".to_string()).into_response()
}

pub async fn ask_stories() -> axum::response::Response {
    (axum::http::StatusCode::OK, "".to_string()).into_response()
}
