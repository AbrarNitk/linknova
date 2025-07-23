use crate::controller::link;
use axum::routing;

async fn foo() -> axum::response::Response {
    axum::response::Response::new("".into())
}

pub async fn router<S>(ctx: crate::ctx::Ctx) -> axum::Router<S> {
    axum::Router::new()
        .nest(
            "/-/link",
            axum::Router::new()
                .route("/topic", routing::post(link::topic::create))
                .route("/topic/{topic-name}", routing::get(link::topic::get))
                .route("/topic", routing::get(link::topic::list))
                .route("/topic/{topic-name}", routing::put(link::topic::update))
                .route("/topic/{topic-name}", routing::delete(link::topic::delete)),
        )
        .nest(
            "/-/link",
            axum::Router::new()
                .route("/cat", routing::post(link::topic::create))
                .route("/cat/{cat-name}", routing::get(link::topic::get))
                .route("/cat", routing::get(link::topic::list))
                .route("/cat/{cat-name}", routing::put(link::topic::update))
                .route("/cat/{cat-name}", routing::delete(link::topic::delete)),
        )
        .with_state(ctx)
}
