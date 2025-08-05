use crate::ctx::Ctx;
use crate::middlewares::user::AuthUser;
use crate::{controller::link::types, controller::response, services::link};
use axum::extract::{Path, State};
use axum::response::Response;
use axum::Extension;
use axum_extra::extract::Query;

#[tracing::instrument(name = "controller::bookmark::create", skip_all)]
pub async fn create(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<types::BmCreateReq>,
) -> Response {
    match link::bookmark::create(&ctx, user.user_id.as_str(), request).await {
        Ok(r) => response::success(axum::http::StatusCode::CREATED, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::bookmark::get", skip_all)]
pub async fn get(State(ctx): State<Ctx>, Path(id): Path<i64>) -> Response {
    match link::bookmark::get(&ctx, id).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::bookmark::update", skip_all)]
pub async fn update(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<i64>,
    axum::Json(request): axum::Json<types::BmUpdateReq>,
) -> Response {
    match link::bookmark::update(&ctx, user.user_id.as_str(), id, request).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[derive(serde::Deserialize)]
pub struct ListQueryParams {
    status: Option<String>,
    #[serde(default)]
    category: Vec<String>,
    topic: Option<String>,
}

#[tracing::instrument(name = "controller::bookmark::list", skip_all)]
pub async fn list(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Query(q): Query<ListQueryParams>,
) -> Response {
    match link::bookmark::list(
        &ctx,
        user.user_id.as_str(),
        &q.topic,
        q.category.as_slice(),
        &q.status,
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

#[tracing::instrument(name = "controller::bookmark::delete", skip_all)]
pub async fn delete(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<i64>,
) -> Response {
    match link::bookmark::delete(&ctx, user.user_id.as_str(), id).await {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::bookmark::add-categories", skip_all)]
pub async fn add_categories(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<i64>,
    axum::Json(req): axum::Json<types::AddCategories>,
) -> Response {
    match link::bookmark::add_categories(&ctx, user.user_id.as_str(), id, req.categories.as_slice())
        .await
    {
        Ok(r) => response::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            tracing::error!("err: {:?}", e);
            response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    }
}

#[tracing::instrument(name = "controller::bookmark::remove-categories", skip_all)]
pub async fn remove_categories(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    Path(bm_id): Path<i64>,
    axum::Json(req): axum::Json<types::AddCategories>,
) -> Response {
    match link::bookmark::remove_category(
        &ctx,
        user.user_id.as_str(),
        bm_id,
        req.categories.as_slice(),
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
