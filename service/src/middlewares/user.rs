use crate::controller::response;
use axum::extract::Request;
use percent_encoding::percent_decode;

#[tracing::instrument(name = "middleware::auth-user", skip_all)]
pub async fn auth_user(
    auth_user: AuthUser,
    mut req: Request,
    next: axum::middleware::Next,
) -> Result<axum::response::Response, axum::response::Response> {
    req.extensions_mut().insert(auth_user);
    Ok(next.run(req).await)
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct AuthUser {
    pub user_id: String,
}

impl AuthUser {
    fn try_from_header(
        parts: &axum::http::request::Parts,
    ) -> Result<Option<String>, super::AuthError> {
        let authorization = parts.headers.get("user-id").map(|h| h.to_str());

        // return if it contains the header
        if let Some(Ok(authorization)) = authorization {
            let auth_header = match percent_decode(authorization.as_bytes()).decode_utf8() {
                Ok(auth_header) => auth_header,
                Err(err) => return Err(super::AuthError::UserDecodeError(err.to_string())),
            };
            return Ok(Some(auth_header.into_owned()));
        }
        Ok(None)
    }
}

impl<B> axum::extract::FromRequestParts<B> for AuthUser
where
    B: Send + Sync,
{
    type Rejection = axum::response::Response;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        _: &B,
    ) -> Result<Self, Self::Rejection> {
        let user_id = match AuthUser::try_from_header(&parts) {
            Ok(u) => u,
            Err(err) => {
                return Err(response::error(
                    axum::http::StatusCode::UNAUTHORIZED,
                    err.to_string(),
                ));
            }
        };

        match user_id {
            Some(u) => Ok(AuthUser { user_id: u }),
            None => {
                return Err(response::error(
                    axum::http::StatusCode::UNAUTHORIZED,
                    "Expected user-id in the header".to_string(),
                ));
            }
        }
    }
}
