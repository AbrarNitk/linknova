mod types;

use crate::controller::link::types::{BmCreateReq, BmResponse, BmUpdateReq};
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::bookmark-create", skip_all)]
pub async fn create(
    ctx: &Ctx,
    user_id: &str,
    req: BmCreateReq,
) -> Result<(), types::BookmarkError> {
    // let row = linkdb::category::CatRowI {
    //     name: req.name,
    //     display_name: req.display_name,
    //     description: req.description,
    //     about: req.about,
    //     priority: 0,
    //     active: true,
    //     public: req.public,
    //     user_id: user_id.to_string(),
    // };
    // linkdb::category::insert(&ctx.pg_pool, row).await?;
    Ok(())
}

#[tracing::instrument(name = "service::bookmark-get", skip_all)]
pub async fn get(ctx: &Ctx, id: i64) -> Result<BmResponse, types::BookmarkError> {
    todo!()
}

#[tracing::instrument(name = "service::bookmark-list", skip_all)]
pub async fn list(ctx: &Ctx, id: &str) -> Result<Vec<BmResponse>, types::BookmarkError> {
    todo!()
}

#[tracing::instrument(name = "service::bookmark-update", skip_all)]
pub async fn update(
    ctx: &Ctx,
    user_id: &str,
    req: BmUpdateReq,
) -> Result<(), types::BookmarkError> {
    Ok(())
}

#[tracing::instrument(name = "service::bookmark-delete", skip_all)]
pub async fn delete(ctx: &Ctx, user_id: &str, id: i64) -> Result<(), types::BookmarkError> {
    Ok(())
}
