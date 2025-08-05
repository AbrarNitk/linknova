use axum::response::Response;
use axum::Router;

pub fn routes() -> axum::Router {
    Router::new()
        .route("/-/ln/api/login", axum::routing::post(login_json))
        .route("/-/ln/api/login-form", axum::routing::post(login_form))
}

#[derive(serde::Deserialize, Debug)]
pub struct LoginReq {
    pub username: String,
    pub password: String,
    #[serde(default)]
    pub remember_me: Option<bool>,
}

// JSON login handler
pub async fn login_json(axum::Json(req): axum::Json<LoginReq>) -> Response {
    handle_login(req).await
}

// Form login handler
pub async fn login_form(axum::Form(req): axum::Form<LoginReq>) -> Response {
    handle_login(req).await
}

// Common login handling logic
async fn handle_login(login_req: LoginReq) -> Response {
    dbg!(&login_req);

    // Simple authentication - accept any username/password for now
    // This is where you would add real authentication logic
    let cookie = format!(
        "X-USER-ID={}; Domain=127.0.0.1; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        login_req.username, // Use actual username instead of hardcoded value
        60 * 60 * 24        // 24 hours in seconds
    );

    axum::response::Response::builder()
        .status(axum::http::status::StatusCode::SEE_OTHER)
        .header(axum::http::header::LOCATION, "/-/ln")
        .header(axum::http::header::SET_COOKIE, cookie)
        .body(axum::body::Body::empty())
        .unwrap()
}
