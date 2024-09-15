use crate::router::Ctx;
use sqlx::PgPool;

#[derive(serde::Deserialize)]
pub struct SaveRequest {
    pub title: Option<String>,
    pub url: String,
    pub reference: Option<String>,
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
    let bookmark_id = insert_into_urls(&ctx.db, request).await?;
    // todo: handle topic handling properly, there can be multiple topics and categories come in the request
    // get the default topic for now
    let topic_id = get_topic_or_default(&ctx.db, "default").await?;
    let categories = if !request.categories.is_empty() {
        // create the categories with the topic in mind
        let cats = request
            .categories
            .iter()
            .map(|name| super::category::Category::new(name, topic_id))
            .collect::<Vec<_>>();
        let cats = super::category::upsert_categories(&ctx.db, &cats).await?;
        cats.into_iter()
            .map(|(_name, cat_id)| (bookmark_id, cat_id))
            .collect::<Vec<_>>()
    } else {
        // get the default category for now
        let cat_id = super::category::get_cat_or_default(&ctx.db, "default").await?;
        vec![(bookmark_id, cat_id)]
    };
    insert_into_bookmark_cat_map(categories.as_slice(), &ctx.db).await?;
    Ok(SaveResponse { id: bookmark_id })
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
    let query_str = format!(
        "select id, name from linknova_directory where name in ({})",
        params
    );
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

pub async fn insert_into_urls(pool: &PgPool, url: &SaveRequest) -> sqlx::Result<i64> {
    use sqlx::Row;
    let now = chrono::Utc::now();
    let query = r#"
        INSERT INTO linknova_bookmark(title, url, reference, is_active, created_on, updated_on)
        values($1, $2, $3, $4, $5, $6)
        returning id
    "#;
    let row = sqlx::query(query)
        .bind(&url.title)
        .bind(&url.url)
        .bind(&url.reference)
        .bind(true)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;
    row.try_get::<i64, _>("id")
}

// map: (bookmark_id, category_id)
pub async fn insert_into_bookmark_cat_map(
    map: &[(i64, i64)],
    pool: &sqlx::PgPool,
) -> sqlx::Result<()> {
    let query = r#"
            INSERT into linknova_bookmark_category_map(bookmark_id, category_id)
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

// note: we create a topic with `default` name with the migrations
pub async fn get_topic_or_default(pool: &sqlx::PgPool, name: &str) -> sqlx::Result<i64> {
    let sql = "SELECT id, name from linknova_topic where name = $1 or name = 'default'";
    let rows: Vec<(i64, String)> = sqlx::query_as(sql).bind(name).fetch_all(pool).await?;
    if let Some(r) = rows.iter().find(|f| f.1.eq(name)) {
        return Ok(r.0);
    }
    if let Some(r) = rows.iter().find(|f| f.1.eq("default")) {
        return Ok(r.0);
    }
    Err(sqlx::error::Error::RowNotFound)
}
