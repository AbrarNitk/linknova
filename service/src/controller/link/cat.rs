use crate::ctx::Ctx;
use axum::extract::{Path, Query, State};
use axum::response::Response;

#[derive(serde::Deserialize)]
pub struct CreateRequest {
    pub name: String,
    pub description: Option<String>,
    pub categories: Vec<String>,
}

pub async fn create(
    State(ctx): State<Ctx>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> Response {
    // match _create(&ctx.db, TopicCreate::from_req(request)).await {
    //     Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
    //     Err(e) => {
    //         eprintln!("err: {:?}", e);
    //         super::error(
    //             axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    //             "some-error-occurred",
    //         )
    //     }
    // }
    todo!()
}

pub async fn get(
    State(ctx): State<Ctx>,
    Path((cat_name, topic_name)): Path<(String, String)>,
) -> axum::response::Response {
    // match get_by_id(&ctx.db, topic_id).await {
    //     Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
    //     Err(e) => {
    //         eprintln!("err: {:?}", e);
    //         super::error(
    //             axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    //             "some-error-occurred",
    //         )
    //     }
    // }
    todo!()
}

pub async fn list(State(ctx): State<Ctx>, Query(topic): Query<String>) -> axum::response::Response {
    // match get_by_id(&ctx.db, topic_id).await {
    //     Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
    //     Err(e) => {
    //         eprintln!("err: {:?}", e);
    //         super::error(
    //             axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    //             "some-error-occurred",
    //         )
    //     }
    // }
    todo!()
}

pub async fn update(
    State(ctx): State<Ctx>,
    Path(cat_name): Path<String>,
) -> axum::response::Response {
    // match get_by_id(&ctx.db, topic_id).await {
    //     Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
    //     Err(e) => {
    //         eprintln!("err: {:?}", e);
    //         super::error(
    //             axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    //             "some-error-occurred",
    //         )
    //     }
    // }
    todo!()
}

pub async fn delete(
    State(ctx): State<Ctx>,
    Path(query): Path<CatApiQuery>,
) -> axum::response::Response {
    // match get_by_id(&ctx.db, topic_id).await {
    //     Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
    //     Err(e) => {
    //         eprintln!("err: {:?}", e);
    //         super::error(
    //             axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    //             "some-error-occurred",
    //         )
    //     }
    // }
    todo!()
}

#[derive(serde::Deserialize, Debug)]
pub struct CatApiQuery {
    #[serde(default)]
    pub topic: Vec<String>,
}
