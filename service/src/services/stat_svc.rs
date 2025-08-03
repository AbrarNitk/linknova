use crate::ctx::Ctx;
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};

pub fn temporary_user_verify(user_id: &str) -> bool {
    println!("{}", user_id);
    true
}

pub async fn handle_index(headers: axum::http::HeaderMap) -> Response {
    // check the login header, if user is valid then redirect it to the home page otherwise
    // return the login page
    let user_id = match headers.get("X-USER-ID") {
        Some(user_id) => user_id.to_str().expect("user-id header is invalid"),
        None => return axum::response::Redirect::permanent("/-/ln/login").into_response(),
    };

    if temporary_user_verify(user_id) {
        axum::response::Response::builder()
            .status(axum::http::status::StatusCode::PERMANENT_REDIRECT)
            .header(axum::http::header::LOCATION, "/-/ln/")
            .header(axum::http::header::SET_COOKIE, "X-USER-ID=some-user-id")
            .body(axum::body::Body::empty())
            .unwrap()
    } else {
        axum::response::Redirect::permanent("/-/ln/login").into_response()
    }
}

pub async fn handle_static(State(ctx): State<Ctx>, Path(path): Path<String>) -> Response {
    // // read the file and return that
    // let (parts, _body) = req.into_parts();
    // let path = parts.uri.path();
    // let absolute_file_path = path.trim_start_matches("/-/ln");
    //
    // // if ends with extension
    //
    //
    // if absolute_file_path.is_empty() || absolute_file_path.eq("/") {
    //     // return index.html file
    // }
    todo!()
}
