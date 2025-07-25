pub mod types;

use crate::controller::link;
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::topic-create", skip_all)]
pub async fn create(
    ctx: &Ctx,
    user_id: &str,
    req: link::topic::CreateRequest) -> Result<(), types::TopicError> {
    tracing::info!(msg="userid", user_id);

    Ok(())
}

#[tracing::instrument(name = "service::topic-get", skip_all)]
pub async fn get(ctx: &Ctx, topic_name: &str) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-list", skip_all)]
pub async fn list(ctx: &Ctx) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-update", skip_all)]
pub async fn update(
    ctx: &Ctx,
    topic_name: &str,
    update_req: link::topic::CreateRequest,
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
