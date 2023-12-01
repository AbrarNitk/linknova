use crate::router::ApiContext;
use axum::response::IntoResponse;
use sqlx::PgPool;

#[derive(serde::Deserialize)]
pub struct SaveRequest {
    pub title: Option<String>,
    pub url: String,
    pub app: Option<String>,
    pub categories: Vec<String>,
    pub tags: Vec<String>,
}

pub async fn insert_into_urls(url: &SaveRequest, pool: &PgPool) -> sqlx::Result<i64> {
    use sqlx::Row;
    let now = chrono::Utc::now();
    let query = "INSERT INTO bookmark(title, url, is_active, created_on, updated_on) values($1, $2, $3, $4, $5) returning id";
    let row = sqlx::query(query)
        .bind(url.title.as_ref().unwrap_or(&"".to_string()))
        .bind(url.url.as_str())
        .bind(true)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;
    row.try_get::<i64, _>("id")
}

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

pub async fn save_url(
    axum::extract::State(ctx): axum::extract::State<ApiContext>,
    axum::Json(request): axum::Json<SaveRequest>,
) -> axum::response::Response {
    match save_url_(&request, &ctx.db).await {
        Ok(r) => success(axum::http::StatusCode::CREATED, "".to_string()),
        Err(e) => {
            eprintln!("err: {:?}", e);
            error(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "some-error-occurred",
            )
        }
    }
}

#[derive(thiserror::Error, std::fmt::Debug)]
pub enum SaveError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
}

async fn save_url_(request: &SaveRequest, pool: &sqlx::PgPool) -> Result<(), SaveError> {
    let insert_id = insert_into_urls(request, pool).await?;
    println!("id: {}", insert_id);
    Ok(())
}

pub async fn _save_url(
    axum::extract::State(ctx): axum::extract::State<ApiContext>,
    axum::Json(request): axum::Json<SaveRequest>,
) -> String {
    use sqlx::Row;
    // request: getting the url and categories
    // get all the categories at runtime and hash-mapped them, with some default value also
    // insert into url table and get the id
    //
    let params = (1..=request.categories.len())
        .map(|x| format!("${}", x))
        .collect::<Vec<_>>()
        .join(",");
    let query_str = format!("select id, name from directory where name in ({})", params);
    println!("{}", query_str);
    let mut query = sqlx::query(&query_str);
    for arg in request.categories.iter() {
        query = query.bind(arg);
    }
    use sqlx::Execute;
    let sql = query.sql();
    println!("{}", sql);
    let rows: Vec<(i64, String)> = query
        .fetch_all(&ctx.db)
        .await
        .unwrap()
        .into_iter()
        .map(|row| (row.get(0), row.get(1)))
        .collect();

    // let rows = sqlx::query!("select id, name from directory where name in ('default')")
    //     .fetch_all(&ctx.db)
    //     .await.unwrap();

    for (c1, c2) in &rows {
        println!("{}:{}", c1, c2);
    }

    println!("{}", rows.len());

    "url-saved".to_string()
}
