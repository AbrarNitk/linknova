mod types;

use crate::controller::link::types::{BmCreateReq, BmResponse};
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::bookmark-create", skip_all)]
pub async fn create(
    ctx: &Ctx,
    user_id: &str,
    req: BmCreateReq,
) -> Result<(), types::BookmarkError> {
    let now = chrono::Utc::now();

    // first upsert the category
    let categories: Vec<_> = req
        .categories
        .iter()
        .map(|c| super::cat::types::from_cat_name(c, user_id))
        .collect();
    let row = types::from_req(req, user_id, now);

    // todo: create links between category and bookmark
    let mut tx = ctx.pg_pool.begin().await?;
    let category_ids = linkdb::category::upsert(&mut tx, categories, now).await?;
    let bm_id = linkdb::bookmark::insert(&mut tx, row).await?;
    linkdb::bookmark::cat_map::add_categories(&mut tx, bm_id, category_ids.as_slice()).await?;
    tx.commit().await?;
    Ok(())
}

#[tracing::instrument(name = "service::bookmark-get", skip_all)]
pub async fn get(ctx: &Ctx, id: i64) -> Result<BmResponse, types::BookmarkError> {
    let row = linkdb::bookmark::get_by_id(&ctx.pg_pool, id).await?;
    let result = types::from_db_response(row);
    Ok(result)
}

// todo: pagination,
// list by topic and category
#[tracing::instrument(name = "service::bookmark-list", skip_all)]
pub async fn list(
    ctx: &Ctx,
    user_id: &str,
    categories: &[String],
    status: &Option<String>,
) -> Result<Vec<BmResponse>, types::BookmarkError> {
    let rows = linkdb::bookmark::filter(&ctx.pg_pool, user_id, Some(categories), status).await?;
    Ok(rows
        .into_iter()
        .map(|r| types::from_db_response(r))
        .collect())
}

#[tracing::instrument(name = "service::bookmark-delete", skip_all)]
pub async fn delete(ctx: &Ctx, _user_id: &str, bm_id: i64) -> Result<(), types::BookmarkError> {
    let mut tx = ctx.pg_pool.begin().await?;

    linkdb::bookmark::query::delete_by_id(&mut tx, bm_id).await?;
    linkdb::bookmark::cat_map::delete_by_bookmark_id(&mut tx, bm_id).await?;
    tx.commit().await?;
    Ok(())
}

#[tracing::instrument(name = "service::bookmark-add-categories", skip_all)]
pub async fn add_categories(
    ctx: &Ctx,
    user_id: &str,
    bm_id: i64,
    categories: &[String],
) -> Result<(), types::BookmarkError> {
    // first upsert the category
    let categories: Vec<_> = categories
        .iter()
        .map(|c| super::cat::types::from_cat_name(c, user_id))
        .collect();

    let mut tx = ctx.pg_pool.begin().await?;
    let now = chrono::Utc::now();
    let category_ids = linkdb::category::upsert(&mut tx, categories, now).await?;
    linkdb::bookmark::cat_map::add_categories(&mut tx, bm_id, category_ids.as_slice()).await?;
    tx.commit().await?;

    Ok(())
}

#[tracing::instrument(name = "service::bookmark-remove-categories", skip_all)]
pub async fn remove_category(
    ctx: &Ctx,
    _user_id: &str,
    bm_id: i64,
    categories: &[String],
) -> Result<(), types::BookmarkError> {
    linkdb::bookmark::cat_map::remove_categories(&ctx.pg_pool, bm_id, categories).await?;
    Ok(())
}
