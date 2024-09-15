use crate::router::Ctx;

#[derive(serde::Deserialize)]
pub struct CreateRequest {
    pub name: String,
    pub title: Option<String>,
    pub about: Option<String>,
    pub topic: Option<String>,
}

pub async fn create(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> axum::response::Response {
    match _create(&ctx.db, request).await {
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

pub async fn _create(pool: &sqlx::PgPool, req: CreateRequest) -> Result<i64, CreateError> {
    let query = r#"
        INSERT INTO linknova_category(name, title, about, created_on, updated_on)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (name)
        DO UPDATE SET
            title=EXCLUDED.title,
            about=EXCLUDED.about,
            updated_on=EXCLUDED.updated_on
        RETURNING id
    "#;

    let now = chrono::Utc::now();
    let (category_id,): (i64,) = sqlx::query_as(query)
        .bind(&req.name)
        .bind(&req.title)
        .bind(&req.about)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;

    if let Some(topic_name) = &req.topic {
        let topic = super::topic::TopicCreate::new(&topic_name);
        let topic_id = super::topic::upsert_topic(pool, &topic).await?;
        cat_topic_map(pool, &vec![(category_id, topic_id)]).await?;
    }

    Ok(category_id)
}

#[derive(thiserror::Error, std::fmt::Debug)]
pub enum CreateError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
    #[error("TopicCreateError: {}", _0)]
    TopicCreate(#[from] super::topic::CreateError),
}

#[derive(Debug)]
pub struct Category {
    pub name: String,
    pub title: Option<String>,
    pub about: Option<String>,
}

impl Category {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_owned(),
            title: None,
            about: None,
        }
    }
}

pub async fn upsert_categories(
    pool: &sqlx::PgPool,
    categories: &[Category],
) -> sqlx::Result<std::collections::HashMap<String, i64>> {
    let sql = r#"
        INSERT INTO linknova_category(name, title, about, created_on, updated_on)
        values($1, $2, $3, $4, $5)
        ON CONFLICT (name)
        DO UPDATE SET
            title = EXCLUDED.title,
            about = EXCLUDED.about,
            updated_on = EXCLUDED.updated_on
        RETURNING id, name
    "#;

    let now = chrono::Utc::now();
    // todo: need improvements
    let mut hm = std::collections::HashMap::new();
    for cat in categories {
        let (row_id, name) = sqlx::query_as::<_, (i64, String)>(sql)
            .bind(&cat.name)
            .bind(&cat.title)
            .bind(&cat.about)
            .bind(now)
            .bind(now)
            .fetch_one(pool)
            .await?;
        hm.insert(name, row_id);
    }
    Ok(hm)
}

// note: we create a category with `default` name with the migrations
pub async fn get_cat_or_default(pool: &sqlx::PgPool, name: &str) -> sqlx::Result<i64> {
    let sql = "SELECT id, name from linknova_category where name = $1 or name = 'default'";
    let rows: Vec<(i64, String)> = sqlx::query_as(sql).bind(name).fetch_all(pool).await?;
    if let Some(r) = rows.iter().find(|f| f.1.eq(name)) {
        return Ok(r.0);
    }
    if let Some(r) = rows.iter().find(|f| f.1.eq("default")) {
        return Ok(r.0);
    }
    Err(sqlx::error::Error::RowNotFound)
}

pub async fn categories(
    pool: &sqlx::PgPool,
) -> sqlx::Result<std::collections::HashMap<String, i64>> {
    use sqlx::Row;
    let query = "SELECT id, name from linknova_category";
    let rows: Vec<sqlx::Result<(String, i64)>> = sqlx::query(query)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|r| -> sqlx::Result<(String, i64)> { Ok((r.try_get("name")?, r.try_get("id")?)) })
        .collect();
    rows.into_iter().collect()
}

// map: (category_id, topic_id)
pub async fn cat_topic_map(pool: &sqlx::PgPool, map: &[(i64, i64)]) -> sqlx::Result<()> {
    let query = r#"
            INSERT into linknova_topic_category_map(category_id, topic_id)
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
