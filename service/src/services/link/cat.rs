pub mod types;

use crate::controller::link;
use crate::ctx::Ctx;

#[tracing::instrument(name = "service::cat-create", skip_all)]
pub async fn create(ctx: &Ctx, req: link::cat::CreateRequest) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-get", skip_all)]
pub async fn get(ctx: &Ctx, cat_name: &str) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-list", skip_all)]
pub async fn list(ctx: &Ctx) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-update", skip_all)]
pub async fn update(ctx: &Ctx, cat_name: &str) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-delete", skip_all)]
pub async fn delete(ctx: &Ctx, cat_name: &str) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-add-topic", skip_all)]
pub async fn add_topic(ctx: &Ctx, cat_name: &str, topic_name: &str) -> Result<(), types::CatError> {
    Ok(())
}

#[tracing::instrument(name = "service::cat-remove-topic", skip_all)]
pub async fn remove_topic(
    ctx: &Ctx,
    cat_name: &str,
    topic_name: &str,
) -> Result<(), types::CatError> {
    Ok(())
}
