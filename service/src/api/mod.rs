pub mod save;

use axum::response::IntoResponse;
pub use save::save_url;


fn success<T: serde::Serialize>(
    status: axum::http::StatusCode,
    data: T,
) -> axum::response::Response {
    #[derive(serde::Serialize)]
    struct Success<T> {
        data: T,
        success: bool,
    }
    (
        status,
        axum::Json(Success {
            data,
            success: true,
        }),
    )
        .into_response()
}

fn error<T: serde::Serialize>(
    status: axum::http::StatusCode,
    error: T,
) -> axum::response::Response {
    #[derive(serde::Serialize)]
    struct Error<T> {
        error: T,
        success: bool,
    }
    (
        status,
        axum::Json(Error {
            error,
            success: false,
        }),
    )
        .into_response()
}