pub fn routes(ctx: crate::Ctx) -> axum::Router {
    axum::Router::new()
        .route(
            "/-/ln",
            axum::routing::get(crate::services::stat_svc::handle_index),
        )
        // Note: this does not match the empty segments
        .route(
            "/-/ln/{*path}",
            axum::routing::get(crate::services::stat_svc::handle_static),
        )
        // // todo: need to remove this logic, all paths must come with the /-/ln as prefix
        .route(
            "/{*path}",
            axum::routing::get(crate::services::stat_svc::handle_static),
        )
        .with_state(ctx)
}
