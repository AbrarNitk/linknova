type CategoryName = String;
type CategoryID = i64;

#[derive(Clone)]
pub struct Ctx {
    pub db: sqlx::PgPool,
    pub category_map:
        std::sync::Arc<std::sync::RwLock<std::collections::HashMap<CategoryName, CategoryID>>>,
}

pub async fn health() -> impl axum::response::IntoResponse {
    "linknove is running"
}

pub async fn routes(ctx: Ctx) -> axum::Router {
    let router = axum::Router::new()
        .route(
            "/linknova/v1/api/health/",
            axum::routing::on(axum::routing::MethodFilter::GET, health),
        )
        .route(
            "/linknova/v1/api/save/",
            axum::routing::on(axum::routing::MethodFilter::PUT, crate::api::save_url),
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
            "/linknova/v1/api/topic/get/:id",
            axum::routing::on(axum::routing::MethodFilter::GET, crate::api::topic::get),
        )
        .route(
            "/linknova/v1/api/topic/get-by-name/:name",
            axum::routing::on(
                axum::routing::MethodFilter::GET,
                crate::api::topic::get_with_name,
            ),
        )
        .route(
            "/linknova/v1/api/topic/list/",
            axum::routing::on(axum::routing::MethodFilter::GET, crate::api::topic::list),
        )
        .route(
            "/linknova/v1/api/category/create/",
            axum::routing::on(
                axum::routing::MethodFilter::PUT,
                crate::api::category::create,
            ),
        )
        .route(
            "/linknova/v1/api/category/list/",
            axum::routing::on(axum::routing::MethodFilter::GET, crate::api::category::list),
        )
        .with_state(ctx);
    router
}
