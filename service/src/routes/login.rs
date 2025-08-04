use axum::response::Response;
use axum::Router;

pub fn routes() -> axum::Router {
    Router::new().route("/-/ln/api/login", axum::routing::post(login))
}

#[derive(serde::Deserialize, Debug)]
pub struct LoginReq {
    pub username: String,
    pub password: String,
}

pub async fn login(axum::Json(req): axum::Json<LoginReq>) -> Response {
    dbg!(req);

    let cookie = format!(
        "X-USER-ID={}; Domain=127.0.0.1; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        "abrark",
        60 * 60 * 24 // 24 hours in seconds
    );

    axum::response::Response::builder()
        .status(axum::http::status::StatusCode::SEE_OTHER)
        .header(axum::http::header::LOCATION, "/-/ln")
        .header(axum::http::header::SET_COOKIE, cookie)
        .body(axum::body::Body::empty())
        .unwrap()
}
