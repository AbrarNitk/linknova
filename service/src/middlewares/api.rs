use crate::controller::response;
use crate::ctx::Ctx;
use axum::extract::{Request, State};
use percent_encoding::percent_decode;


#[tracing::instrument(name = "middleware::verify-secrets", skip_all)]
pub async fn verify_secrets(
    State(ctx): State<Ctx>,
    secrets: APISecrets,
    req: Request,
    next: axum::middleware::Next,
) -> Result<axum::response::Response, axum::response::Response> {
    if !secrets.api_secrets.eq(ctx.secret.as_str()) {
        return Err(response::error(
            axum::http::StatusCode::UNAUTHORIZED,
            "Secrets are not accepted",
        ));
    }
    Ok(next.run(req).await)
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct APISecrets {
    api_secrets: String,
}

impl<B> axum::extract::FromRequestParts<B> for APISecrets
where
    B: Send + Sync,
{
    type Rejection = axum::response::Response;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _: &B,
    ) -> Result<Self, Self::Rejection> {
        let secrets = match APISecrets::try_from_header(&parts) {
            Ok(u) => u,
            Err(err) => {
                return Err(response::error(
                    axum::http::StatusCode::UNAUTHORIZED,
                    err.to_string(),
                ));
            }
        };

        match secrets {
            Some(s) => Ok(Self { api_secrets: s }),
            None => Err(response::error(
                axum::http::StatusCode::UNAUTHORIZED,
                "Expected api-secrets in the header".to_string(),
            )),
        }
    }
}

impl APISecrets {
    fn try_from_header(
        parts: &axum::http::request::Parts,
    ) -> Result<Option<String>, super::AuthError> {
        let api_secrets = parts.headers.get("secrets").map(|h| h.to_str());

        // return if it contains the header
        if let Some(Ok(secrets)) = api_secrets {
            let secrets = match percent_decode(secrets.as_bytes()).decode_utf8() {
                Ok(secrets) => secrets,
                Err(_err) => return Err(super::AuthError::InvalidSecrets),
            };
            return Ok(Some(secrets.into_owned()));
        }
        Ok(None)
    }
}
