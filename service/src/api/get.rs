use crate::router::ApiContext;

#[derive(serde::Deserialize, Debug)]
pub struct GetUrlQuery {
    cat: Option<String>,
    p_no: Option<usize>,
    size: Option<usize>,
}

pub async fn get_urls(
    axum::extract::State(ctx): axum::extract::State<ApiContext>,
    axum::extract::Query(query): axum::extract::Query<GetUrlQuery>,
) -> axum::response::Response {
    println!("query: {:?}", query);

    // get all the category ids from rh cache
    let cats = query
        .cat
        .unwrap_or("".to_string())
        .split(',')
        .flat_map(|c| ctx.category_map.get(c))
        .collect::<Vec<_>>();
    let p_no = query.p_no.unwrap_or(1);
    let size = query.size.unwrap_or(10);
    match get_urls_(&ctx, &cats, p_no, size).await {
        Ok(r) => super::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            println!("{:?}", e);
            super::error(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "somethings went wrong",
            )
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum GetUrlsError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
}

#[derive(serde::Serialize)]
pub struct GetUrlsResponse {
    next: Option<usize>,
}

pub async fn get_urls_(
    ctx: &ApiContext,
    categories: &[&i64],
    p_no: usize,
    size: usize,
) -> Result<GetUrlsResponse, GetUrlsError> {
    Ok(GetUrlsResponse {})
}
