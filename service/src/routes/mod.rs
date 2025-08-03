mod health;
mod hn;
mod link;
pub mod login;
mod statics;

pub async fn routes(ctx: crate::Ctx) -> axum::Router {
    let router = axum::Router::new()
        .route(
            "/-/ln/health",
            axum::routing::on(axum::routing::MethodFilter::GET, health::health),
        )
        .merge(
            link::router(ctx.clone())
                .await
                .route_layer(axum::middleware::from_fn(
                    crate::middlewares::user::auth_user,
                ))
                .route_layer(axum::middleware::from_fn_with_state(
                    ctx.clone(),
                    crate::middlewares::api::verify_secrets,
                )),
        )
        .merge(login::routes())
        .merge(statics::routes(ctx))
        .merge(hn::router().await);

    // .route(
    //     "/linknova/v1/api/save/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::POST,
    //         crate::controller::save_url,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/list/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::GET,
    //         crate::controller::get_urls,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/topic/create/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::PUT,
    //         crate::controller::topic::create,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/topic/get/{id}",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::GET,
    //         crate::controller::topic::get,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/topic/get-by-name/{name}",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::GET,
    //         crate::controller::topic::get_with_name,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/topic/list/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::GET,
    //         crate::controller::topic::list,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/category/create/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::PUT,
    //         crate::controller::category::create,
    //     ),
    // )
    // .route(
    //     "/linknova/v1/api/category/list/",
    //     axum::routing::on(
    //         axum::routing::MethodFilter::GET,
    //         crate::controller::category::list,
    //     ),
    // )
    // .with_state(ctx);
    router
}
