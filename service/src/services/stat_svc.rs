use crate::ctx::Ctx;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use std::fs;
use std::path::PathBuf;

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
    println!("file-path: {}", path);

    // if file exists then canonicalize check and serve

    // 1. try serving the path as it is
    let file_path_variant_1 = ctx.static_dir.join(&path);
    if let Some(response) = check_and_serve(&ctx.static_dir, file_path_variant_1).await {
        return response;
    }

    // 2. try serving the path /path.html
    let mut file_path_variant_2 = ctx.static_dir.join(&path);
    file_path_variant_2.set_extension("html");
    println!("2. trying: {}", file_path_variant_2.display());
    if let Some(response) = check_and_serve(&ctx.static_dir, file_path_variant_2).await {
        return response;
    }

    // 3. try serving the path /path/index.html
    let file_path_variant_3 = ctx.static_dir.join(&path).join("index.html");
    println!("3. trying: {}", file_path_variant_3.display());
    if let Some(response) = check_and_serve(&ctx.static_dir, file_path_variant_3).await {
        return response;
    }

    // return 404 if file not found
    StatusCode::NOT_FOUND.into_response()
}

async fn check_and_serve(base_path: &std::path::Path, file_path: PathBuf) -> Option<Response> {
    // First, check if the file exists without canonicalizing,
    // to avoid an error for non-existent paths.
    if !file_path.exists() {
        return None;
    }

    // Then, canonicalize the existing path to resolve `..` and symlinks.
    let canonical_path = match fs::canonicalize(&file_path) {
        Ok(p) => p,
        Err(_) => return None, // An error here means the file isn't accessible, so treat as not found.
    };

    // The crucial security check.
    if !canonical_path.starts_with(base_path) {
        return Some(StatusCode::FORBIDDEN.into_response());
    }
    Some(read_and_serve_file(canonical_path).await)
}

async fn read_and_serve_file(path: std::path::PathBuf) -> Response {
    match tokio::fs::read(&path).await {
        Ok(content) => {
            let mime_type = mime_guess::from_path(&path).first_or_octet_stream();
            let mut response = content.into_response();
            response.headers_mut().insert(
                axum::http::header::CONTENT_TYPE,
                axum::http::HeaderValue::from_str(mime_type.as_ref()).unwrap(),
            );
            response
        }
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}
