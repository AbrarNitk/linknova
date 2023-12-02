async fn index() -> String {
    "".to_string()
}

pub async fn router() -> axum::Router {
    axum::Router::new()
        .route(
            "/hn/v1/api/get-item/:id/",
            axum::routing::get(super::controller::get_item),
        )
        .route(
            "/hn/v1/api/user/:username/",
            axum::routing::get(super::controller::get_user),
        )
        .route(
            "/hn/v1/api/top-stories/",
            axum::routing::get(super::controller::top_stories),
        )
        .route(
            "/hn/v1/api/ask-stories/",
            axum::routing::get(super::controller::ask_stories),
        )
}
