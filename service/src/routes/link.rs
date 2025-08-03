use crate::controller::link;
use axum::routing;

pub async fn router<S>(ctx: crate::ctx::Ctx) -> axum::Router<S> {
    axum::Router::new()
        .nest(
            "/-/ln/v1/api/",
            axum::Router::new()
                .route("/topic", routing::post(link::topic::create))
                .route("/topic/{topic-name}", routing::get(link::topic::get))
                .route("/topic", routing::get(link::topic::list))
                .route("/topic/{topic-name}", routing::put(link::topic::update))
                .route("/topic/{topic-name}", routing::delete(link::topic::delete))
                .route(
                    "/topic/{topic-name}/{cat-name}",
                    routing::put(link::topic::add_cat),
                )
                .route(
                    "/topic/{topic-name}/{cat-name}",
                    routing::delete(link::topic::remove_cat),
                ),
        )
        .nest(
            "/-/ln/v1/api/",
            axum::Router::new()
                .route("/cat", routing::post(link::cat::create))
                .route("/cat/{cat-name}", routing::get(link::cat::get))
                .route("/cat", routing::get(link::cat::list))
                .route("/cat/{cat-name}", routing::put(link::cat::update))
                .route("/cat/{cat-name}", routing::delete(link::cat::delete))
                .route(
                    "/cat/{cat-name}/{topic-name}",
                    routing::put(link::cat::add_topic),
                )
                .route(
                    "/cat/{cat-name}/{topic-name}",
                    routing::delete(link::cat::remove_topic),
                ),
        )
        .nest(
            "/-/ln/v1/api/",
            axum::Router::new()
                .route("/bm", routing::post(link::bookmark::create))
                .route("/bm/{id}", routing::get(link::bookmark::get))
                .route("/bm", routing::get(link::bookmark::list))
                .route("/bm/{id}", routing::delete(link::bookmark::delete))
                .route(
                    "/bm/add-cats/{id}",
                    routing::put(link::bookmark::add_categories),
                )
                .route(
                    "/bm/remove-cats/{id}",
                    routing::delete(link::bookmark::remove_categories),
                ),
        )
        .with_state(ctx)
}
