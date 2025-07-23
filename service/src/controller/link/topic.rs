use crate::controller::response;
use crate::ctx::Ctx;
use crate::services::link;
use axum::extract::{Path, State};
use axum::response::Response;

#[derive(serde::Deserialize)]
pub struct CreateRequest {
    pub name: String,
    pub description: Option<String>,
    pub display_name: Option<String>,
    pub priority: Option<i32>,
    #[serde(default)]
    pub public: bool,
    pub user: String,
}

#[tracing::instrument(name = "controller::topic::create", skip_all)]
pub async fn create(
    State(ctx): State<Ctx>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> Response {
    match link::topic::create(&ctx, request).await {
        Ok(r) => response::success(axum::http::StatusCode::CREATED, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::topic::get", skip_all)]
pub async fn get(State(ctx): State<Ctx>, Path(topic_name): Path<String>) -> Response {
    match link::topic::get(&ctx, topic_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

pub async fn list(State(ctx): State<Ctx>) -> Response {
    match link::topic::list(&ctx).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

pub async fn update(
    State(ctx): State<Ctx>,
    Path(topic_name): Path<String>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> Response {
    match link::topic::update(&ctx, topic_name.as_str(), request).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

pub async fn delete(State(ctx): State<Ctx>, Path(topic_name): Path<String>) -> Response {
    match link::topic::delete(&ctx, topic_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}
