use crate::controller::link;
use crate::ctx::Ctx;
use crate::middlewares::user::AuthUser;
use axum::extract::State;
use axum::response::Response;
use axum::Extension;

#[tracing::instrument(name = "controller::bookmark::create", skip_all)]
pub async fn create(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<link::types::BmCreateReq>,
) -> Response {
    //     match link::cat::create(&ctx, user.user_id.as_str(), request).await {
    //         Ok(r) => response::success(axum::http::StatusCode::CREATED, r),
    //         Err(e) => {
    //             tracing::error!("err: {:?}", e);
    //             response::error(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    //         }
    //     }
    todo!()
}

pub async fn list(State(ctx): State<Ctx>, Extension(user): Extension<AuthUser>) -> Response {
    todo!()
}

pub async fn update(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<link::types::BmUpdateReq>,
) -> Response {
    todo!()
}

pub async fn delete(
    State(ctx): State<Ctx>,
    Extension(user): Extension<AuthUser>,
    axum::Json(request): axum::Json<link::types::BmUpdateReq>,
) -> Response {
    todo!()
}
