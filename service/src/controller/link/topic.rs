use axum::Extension;
use crate::controller::response;
use crate::ctx::Ctx;
use crate::services::link;
use axum::extract::{Path, State};
use axum::response::Response;
use crate::middlewares::user::AuthUser;

#[derive(serde::Deserialize)]
pub struct CreateRequest {
    pub name: String,
    pub description: Option<String>,
    pub display_name: Option<String>,
    pub priority: Option<i32>,
    #[serde(default)]
    pub public: bool,
}

#[tracing::instrument(name = "controller::topic::create", skip_all, parent=None)]
pub async fn create(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> Response {
    tracing::info!(msg="userid", user.user_id);
    match link::topic::create(&ctx, user.user_id.as_str(), request).await {
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

#[tracing::instrument(name = "controller::topic::list", skip_all)]
pub async fn list(State(ctx): State<Ctx>) -> Response {
    match link::topic::list(&ctx).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::topic::update", skip_all)]
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

#[tracing::instrument(name = "controller::topic::delete", skip_all)]
pub async fn delete(State(ctx): State<Ctx>, Path(topic_name): Path<String>) -> Response {
    match link::topic::delete(&ctx, topic_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::topic::add-category", skip_all)]
pub async fn add_cat(
    State(ctx): State<Ctx>,
    Path((topic_name, cat_name)): Path<(String, String)>,
) -> Response {
    match link::topic::add_category(&ctx, topic_name.as_str(), cat_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::topic::remove-category", skip_all)]
pub async fn remove_cat(
    State(ctx): State<Ctx>,
    Path((topic_name, cat_name)): Path<(String, String)>,
) -> Response {
    match link::topic::remove_category(&ctx, topic_name.as_str(), cat_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}
