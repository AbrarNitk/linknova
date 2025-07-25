pub mod types;

use crate::controller::link;
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::topic-create", skip_all)]
pub async fn create(
    ctx: &Ctx,
    user_id: &str,
    req: link::types::CreateRequest,
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
    topic_name: &str,
) -> Result<link::types::GetResponse, types::TopicError> {
    let topic_row = linkdb::topic::get_by_name(&ctx.pg_pool, topic_name).await?;

    match topic_row {
        Some(t) => Ok(link::types::GetResponse {
            name: t.name,
            description: t.description,
            display_name: t.display_name,
            priority: t.priority,
            about: t.about,
            public: false,
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
pub async fn list(ctx: &Ctx) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-update", skip_all)]
pub async fn update(
    ctx: &Ctx,
    topic_name: &str,
    update_req: link::types::CreateRequest,
) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-delete", skip_all)]
pub async fn delete(ctx: &Ctx, topic_name: &str) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-add-category", skip_all)]
pub async fn add_category(
    ctx: &Ctx,
    topic_name: &str,
    cat_name: &str,
) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-remove-category", skip_all)]
pub async fn remove_category(
    ctx: &Ctx,
    topic_name: &str,
    cat_name: &str,
) -> Result<(), types::TopicError> {
    Ok(())
}
