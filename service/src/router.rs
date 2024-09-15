async fn index() -> String {
    "index".to_string()
}

type CategoryName = String;
type CategoryID = i64;

#[derive(Clone)]
pub struct Ctx {
    pub db: sqlx::PgPool,
    pub category_map: std::collections::HashMap<CategoryName, CategoryID>,
}

pub async fn health() -> impl axum::response::IntoResponse {
    "linknove is running"
}

pub async fn routes(
    db: sqlx::PgPool,
    categories: std::collections::HashMap<CategoryName, CategoryID>,
) -> axum::Router {
    let router = axum::Router::new()
        .route(
            "/linknova/v1/api/health/",
            axum::routing::on(axum::routing::MethodFilter::GET, health),
        )
        .route(
            "/linknova/v1/api/save/",
            axum::routing::on(axum::routing::MethodFilter::POST, crate::api::save_url),
        )
        .route(
            "/linknova/v1/api/list/",
            axum::routing::on(axum::routing::MethodFilter::GET, crate::api::get_urls),
        )
        .route(
            "/linknova/v1/api/topic/create/",
            axum::routing::on(axum::routing::MethodFilter::PUT, crate::api::topic::create),
        )
        .route(
            "/linknova/v1/api/category/create/",
            axum::routing::on(axum::routing::MethodFilter::GET, index),
        )
        .with_state(Ctx {
            db,
            category_map: categories,
        });
    router
}
