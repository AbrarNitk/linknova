async fn index() -> String {
    "index".to_string()
}

#[derive(Clone)]
pub struct ApiContext {
    pub db: sqlx::PgPool,
}

pub async fn routes(db: sqlx::PgPool) -> axum::Router {
    let router = axum::Router::new()
        .route(
            "/linknova/v1/api/save/",
            axum::routing::on(axum::routing::MethodFilter::POST, crate::api::save_url),
        )
        .route(
            "/linknova/v1/api/get/",
            axum::routing::on(axum::routing::MethodFilter::GET, index),
        )
        .route(
            "/linknova/v1/api/create/topic/",
            axum::routing::on(axum::routing::MethodFilter::PUT, index),
        )
        .route(
            "/linknova/v1/api/create/category/",
            axum::routing::on(axum::routing::MethodFilter::GET, index),
        )
        .with_state(ApiContext { db });
    router
}
