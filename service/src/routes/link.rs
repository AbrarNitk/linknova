use axum::routing;

async fn foo() -> axum::response::Response {
    axum::response::Response::new("".into())
}

pub async fn router<S>(ctx: crate::ctx::Ctx) -> axum::Router<S> {
    axum::Router::new()
        .nest(
            "/-/link",
            axum::Router::new().route("/topic", routing::get(foo)),
        )
        .nest(
            "/-/link",
            axum::Router::new().route("/-/link", routing::get(foo)),
        )
        .with_state(ctx)
}
