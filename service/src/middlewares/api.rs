use crate::ctx::Ctx;
use axum::extract::State;

pub async fn verify_secrets(
    State(ctx): State<Ctx>,
) -> Result<axum::response::Response, axum::response::Response> {
    todo!()
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum AuthSecrets {}

impl<B> axum::extract::FromRequestParts<B> for AuthSecrets
where
    B: Send + Sync,
{
    type Rejection = axum::response::Response;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _: &B,
    ) -> Result<Self, Self::Rejection> {
        todo!()
    }
}
