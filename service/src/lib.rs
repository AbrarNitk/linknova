pub mod controller;
pub mod ctx;
pub mod errors;
pub mod hn;
pub mod router;
pub mod routes;
pub mod settings;
pub mod utils;

use ctx::Ctx;

pub use controller::{error, success};

pub fn serve_static() -> axum::Router {
    axum::Router::new().nest_service(
        "/linknova/static/",
        tower_http::services::ServeDir::new("ui/"),
    )
}
