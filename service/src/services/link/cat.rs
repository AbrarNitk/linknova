pub mod types;
use crate::controller::link::types::{CatCreateReq, CatGetRes};
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::cat-create", skip_all)]
pub async fn create(ctx: &Ctx, user_id: &str, req: CatCreateReq) -> Result<(), types::CatError> {
    let row = types::from_req(req, user_id);
    linkdb::category::insert(&ctx.pg_pool, row).await?;
    Ok(())
}

#[tracing::instrument(name = "service::cat-get", skip_all)]
pub async fn get(ctx: &Ctx, user_id: &str, cat_name: &str) -> Result<CatGetRes, types::CatError> {
    let cat_row = linkdb::category::get_by_name(&ctx.pg_pool, user_id, cat_name)
        .await?
        .ok_or_else(|| {
            types::CatError::NotFound(format!("cat with name: `{}` not found", cat_name))
        })?;
    Ok(CatGetRes {
        name: cat_row.name,
        display_name: cat_row.display_name,
        about: cat_row.about,
        description: cat_row.description,
        public: cat_row.public,
        priority: cat_row.priority,
        created_on: cat_row.created_on,
        updated_on: cat_row.updated_on,
    })
}

#[tracing::instrument(name = "service::cat-list", skip_all)]
pub async fn list(
    ctx: &Ctx,
    user_id: &str,
    topics: &[String],
) -> Result<Vec<CatGetRes>, types::CatError> {
    tracing::info!(msg="topics", t=?topics);

    let cat_rows = if topics.is_empty() {
        linkdb::category::list_all(&ctx.pg_pool, user_id).await?
    } else {
        linkdb::category::list_by_topic_name(&ctx.pg_pool, user_id, topics).await?
    };
    Ok(cat_rows
        .into_iter()
        .map(|cat_row| CatGetRes {
            name: cat_row.name,
            display_name: cat_row.display_name,
            about: None,
            description: cat_row.description,
            public: cat_row.public,
            priority: cat_row.priority,
            created_on: cat_row.created_on,
            updated_on: cat_row.updated_on,
        })
        .collect())
}

#[tracing::instrument(name = "service::cat-update", skip_all)]
pub async fn update(
    _ctx: &Ctx,
    _cat_name: &str,
    _req: CatCreateReq,
) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-delete", skip_all)]
pub async fn delete(ctx: &Ctx, user_id: &str, cat_name: &str) -> Result<(), types::CatError> {
    linkdb::category::delete(&ctx.pg_pool, user_id, cat_name).await?;
    Ok(())
}

#[tracing::instrument(name = "service::cat-add-topic", skip_all)]
pub async fn add_topic(
    ctx: &Ctx,
    user_id: &str,
    cat_name: &str,
    topic_name: &str,
) -> Result<(), types::CatError> {
    let topic_id = linkdb::topic::get_id_by_name(&ctx.pg_pool, user_id, topic_name)
        .await?
        .ok_or_else(|| types::CatError::NotFound(format!("topic with name: `{}`", topic_name)))?;
    let category_id = linkdb::category::get_id_by_name(&ctx.pg_pool, user_id, cat_name)
        .await?
        .ok_or_else(|| types::CatError::NotFound(format!("category with name: `{}`", cat_name)))?;
    linkdb::topic_cat_map::connect(&ctx.pg_pool, topic_id, category_id).await?;

    Ok(())
}

#[tracing::instrument(name = "service::cat-remove-topic", skip_all)]
pub async fn remove_topic(
    ctx: &Ctx,
    user_id: &str,
    cat_name: &str,
    topic_name: &str,
) -> Result<(), types::CatError> {
    let topic_id = linkdb::topic::get_id_by_name(&ctx.pg_pool, user_id, topic_name)
        .await?
        .ok_or_else(|| types::CatError::NotFound(format!("topic with name: `{}`", topic_name)))?;
    let category_id = linkdb::category::get_id_by_name(&ctx.pg_pool, user_id, cat_name)
        .await?
        .ok_or_else(|| types::CatError::NotFound(format!("category with name: `{}`", cat_name)))?;
    linkdb::topic_cat_map::delete(&ctx.pg_pool, topic_id, category_id).await?;
    Ok(())
}
