use crate::router::Ctx;
use sqlx::PgPool;

#[derive(serde::Deserialize)]
pub struct SaveRequest {
    pub title: Option<String>,
    pub url: String,
    pub app: Option<String>,
    pub categories: Vec<String>,
    pub tags: Vec<String>,
}

pub async fn save_url(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    axum::Json(request): axum::Json<SaveRequest>,
) -> axum::response::Response {
    match save_url_(&ctx, &request).await {
        Ok(r) => super::success(axum::http::StatusCode::CREATED, r),
        Err(e) => {
            eprintln!("err: {:?}", e);
            super::error(
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
    #[error("DefaultCategoryNotFoundError")]
    DefaultCategoryNotFound,
}

#[derive(serde::Serialize)]
pub struct SaveResponse {
    pub id: i64,
}

async fn save_url_(ctx: &Ctx, request: &SaveRequest) -> Result<SaveResponse, SaveError> {
    let bookmark_id = insert_into_urls(request, &ctx.db).await?;
    let mut v: Vec<(i64, i64)> = vec![];
    for cat in request.categories.iter() {
        match ctx.category_map.get(cat) {
            Some(cat_id) => v.push((bookmark_id, *cat_id as i64)),
            None => {
                let default_cat = ctx
                    .category_map
                    .get("default")
                    .ok_or_else(|| SaveError::DefaultCategoryNotFound)?;
                v.push((bookmark_id, *default_cat as i64));
            }
        }
    }
    insert_into_bookmark_dir_map(v.as_slice(), &ctx.db).await?;
    Ok(SaveResponse { id: bookmark_id })
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

pub async fn insert_into_bookmark_dir_map(
    map: &[(i64, i64)],
    pool: &sqlx::PgPool,
) -> sqlx::Result<()> {
    let query = r#"
            INSERT into bookmark_directory_map(bookmark_id, directory_id)
            SELECT * from UNNEST($1, $2)
            RETURNING id
    "#;
    sqlx::query(query)
        .bind(map.iter().map(|x| x.0).collect::<Vec<_>>())
        .bind(map.iter().map(|x| x.1).collect::<Vec<_>>())
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn categories(
    pool: &sqlx::PgPool,
) -> sqlx::Result<std::collections::HashMap<String, i64>> {
    use sqlx::Row;
    let query = "SELECT id, name from directory";
    let rows: Vec<sqlx::Result<(String, i64)>> = sqlx::query(query)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|r| -> sqlx::Result<(String, i64)> { Ok((r.try_get("name")?, r.try_get("id")?)) })
        .collect();
    rows.into_iter().collect()
}

pub async fn _save_url(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
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

    for (c1, c2) in &rows {
        println!("{}:{}", c1, c2);
    }

    println!("{}", rows.len());

    "url-saved".to_string()
}
