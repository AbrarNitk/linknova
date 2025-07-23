pub mod types;

use crate::controller::link;
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::topic-create", skip_all)]
pub fn create(ctx: &Ctx, req: link::topic::CreateRequest) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-get", skip_all)]
pub fn get(ctx: &Ctx, topic_name: &str) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-list", skip_all)]
pub fn list(ctx: &Ctx) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-update", skip_all)]
pub fn update(ctx: &Ctx, topic_name: &str) -> Result<(), types::TopicError> {
    Ok(())
}

#[tracing::instrument(name = "service::topic-delete", skip_all)]
pub fn delete(ctx: &Ctx, topic_name: &str) -> Result<(), types::TopicError> {
    Ok(())
}
