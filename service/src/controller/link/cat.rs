use super::types::CatCreateReq;
use crate::controller::response;
use crate::ctx::Ctx;
use crate::middlewares::user::AuthUser;
use crate::services::link;
use axum::extract::{Path, State};
use axum::response::Response;
use axum::Extension;
use axum_extra::extract::Query;

#[tracing::instrument(name = "controller::cat::create", skip_all)]
pub async fn create(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<CatCreateReq>,
) -> Response {
    match link::cat::create(&ctx, user.user_id.as_str(), request).await {
        Ok(r) => response::success(axum::http::StatusCode::CREATED, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::get", skip_all)]
pub async fn get(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(cat_name): Path<String>,
) -> Response {
    match link::cat::get(&ctx, user.user_id.as_str(), cat_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::list", skip_all)]
pub async fn list(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Query(query): Query<CatApiQuery>,
) -> Response {
    match link::cat::list(&ctx, user.user_id.as_str(), query.topic.as_slice()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::update", skip_all)]
pub async fn update(
    State(ctx): State<Ctx>,
    Path(cat_name): Path<String>,
    axum::Json(request): axum::Json<CatCreateReq>,
) -> Response {
    match link::cat::update(&ctx, cat_name.as_str(), request).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::delete", skip_all)]
pub async fn delete(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(cat_name): Path<String>,
) -> Response {
    match link::cat::delete(&ctx, user.user_id.as_str(), cat_name.as_str()).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::add-topic", skip_all)]
pub async fn add_topics(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path((cat_name, topic_name)): Path<(String, String)>,
) -> Response {
    match link::cat::add_topic(
        &ctx,
        user.user_id.as_str(),
        cat_name.as_str(),
        topic_name.as_str(),
    )
    .await
    {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::cat::remove-topic", skip_all)]
pub async fn remove_topics(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path((cat_name, topic_name)): Path<(String, String)>,
) -> Response {
    match link::cat::remove_topic(
        &ctx,
        user.user_id.as_str(),
        cat_name.as_str(),
        topic_name.as_str(),
    )
    .await
    {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[derive(serde::Deserialize, Debug)]
pub struct CatApiQuery {
    #[serde(default)]
    pub topic: Vec<String>,
}
