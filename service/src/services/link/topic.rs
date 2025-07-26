pub mod types;

use crate::controller::link;
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::topic-create", skip_all)]
pub async fn create(
    ctx: &Ctx,
    user_id: &str,
    req: link::types::TopicCreateReq,
) -> Result<(), types::TopicError> {
    tracing::info!(msg = "userid", user_id);

    let row = linkdb::topic::TopicRowI {
        name: req.name,
        display_name: req.display_name,
        description: req.description,
        about: req.about,
        priority: req.priority.unwrap_or(0),
        active: true,
        public: false,
        user_id: user_id.to_string(),
    };
    linkdb::topic::insert(&ctx.pg_pool, row).await?;
    Ok(())
}

#[tracing::instrument(name = "service::topic-get", skip_all)]
pub async fn get(
    ctx: &Ctx,
    user_id: &str,
    topic_name: &str,
) -> Result<link::types::TopicGetRes, types::TopicError> {
    let topic_row = linkdb::topic::get_by_name(&ctx.pg_pool, user_id, topic_name).await?;
    match topic_row {
        Some(t) => Ok(link::types::TopicGetRes {
            name: t.name,
            description: t.description,
            display_name: t.display_name,
            priority: t.priority,
            about: t.about,
            public: t.public,
            created_on: t.created_on,
            updated_on: t.updated_on,
        }),
        None => Err(types::TopicError::NotFound(format!(
            "topic not found with name: {}",
            topic_name
        ))),
    }
}

#[tracing::instrument(name = "service::topic-list", skip_all)]
pub async fn list(
    ctx: &Ctx,
    user_id: &str,
) -> Result<Vec<link::types::TopicGetRes>, types::TopicError> {
    let rows = linkdb::topic::list_all(&ctx.pg_pool, user_id).await?;
    Ok(rows
        .into_iter()
        .map(|r| link::types::TopicGetRes {
            name: r.name,
            description: r.description,
            display_name: r.display_name,
            priority: r.priority,
            about: None,
            public: r.public,
            created_on: r.created_on,
            updated_on: r.updated_on,
        })
        .collect())
}

#[tracing::instrument(name = "service::topic-update", skip_all)]
pub async fn update(
    _ctx: &Ctx,
    _topic_name: &str,
    _update_req: link::types::TopicCreateReq,
) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-delete", skip_all)]
pub async fn delete(ctx: &Ctx, user_id: &str, topic_name: &str) -> Result<(), types::TopicError> {
    linkdb::topic::delete(&ctx.pg_pool, user_id, topic_name).await?;
    Ok(())
}

#[tracing::instrument(name = "service::topic-add-category", skip_all)]
pub async fn add_category(
    ctx: &Ctx,
    user_id: &str,
    topic_name: &str,
    cat_name: &str,
) -> Result<(), types::TopicError> {
    let topic_id = linkdb::topic::get_id_by_name(&ctx.pg_pool, user_id, topic_name)
        .await?
        .ok_or_else(|| types::TopicError::NotFound(format!("topic with name: `{}`", topic_name)))?;
    let category_id = linkdb::category::get_id_by_name(&ctx.pg_pool, user_id, cat_name)
        .await?
        .ok_or_else(|| {
            types::TopicError::NotFound(format!("category with name: `{}`", cat_name))
        })?;

    linkdb::topic_cat_map::connect(&ctx.pg_pool, topic_id, category_id).await?;

    Ok(())
}

#[tracing::instrument(name = "service::topic-remove-category", skip_all)]
pub async fn remove_category(
    ctx: &Ctx,
    user_id: &str,
    topic_name: &str,
    cat_name: &str,
) -> Result<(), types::TopicError> {
    let topic_id = linkdb::topic::get_id_by_name(&ctx.pg_pool, user_id, topic_name)
        .await?
        .ok_or_else(|| types::TopicError::NotFound(format!("topic with name: `{}`", topic_name)))?;
    let category_id = linkdb::category::get_id_by_name(&ctx.pg_pool, user_id, cat_name)
        .await?
        .ok_or_else(|| {
            types::TopicError::NotFound(format!("category with name: `{}`", cat_name))
        })?;

    linkdb::topic_cat_map::remove(&ctx.pg_pool, topic_id, category_id).await?;

    Ok(())
}
