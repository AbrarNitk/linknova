use crate::router::Ctx;

#[derive(serde::Deserialize)]
pub struct CreateRequest {
    pub name: String,
    pub description: Option<String>,
    pub categories: Vec<String>,
}

pub async fn create(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    axum::Json(request): axum::Json<CreateRequest>,
) -> axum::response::Response {
    match _create(&ctx.db, TopicCreate::from_req(request)).await {
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

pub async fn list(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
) -> axum::response::Response {
    match _list(&ctx.db).await {
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

pub async fn _create(pool: &sqlx::PgPool, req: TopicCreate) -> Result<i64, CreateError> {
    let topic_id = upsert_topic(pool, &req).await?;
    if !req.categories.is_empty() {
        let cats = req
            .categories
            .iter()
            .map(|name| super::category::Category::new(name))
            .collect::<Vec<_>>();
        super::category::upsert_categories(pool, &cats).await?;
    }
    Ok(topic_id)
}

pub async fn _list(
    pool: &sqlx::PgPool,
) -> Result<std::collections::HashMap<String, i64>, sqlx::Error> {
    use sqlx::Row;
    let query = "SELECT id, name from linknova_topic";
    let rows: Vec<sqlx::Result<(String, i64)>> = sqlx::query(query)
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|r| -> sqlx::Result<(String, i64)> { Ok((r.try_get("name")?, r.try_get("id")?)) })
        .collect();
    rows.into_iter().collect()
}

pub async fn upsert_topic(pool: &sqlx::PgPool, req: &TopicCreate) -> Result<i64, CreateError> {
    let query = r#"
        INSERT INTO linknova_topic(name, description, is_active, created_on, updated_on)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (name)
        DO UPDATE SET
            description=EXCLUDED.description,
            is_active=EXCLUDED.is_active,
            updated_on=EXCLUDED.updated_on
        RETURNING id
    "#;

    let now = chrono::Utc::now();
    let (topic_id,): (i64,) = sqlx::query_as(query)
        .bind(&req.name)
        .bind(&req.description)
        .bind(true)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;
    Ok(topic_id)
}

pub struct TopicCreate {
    pub name: String,
    pub description: Option<String>,
    pub categories: Vec<String>,
}

impl TopicCreate {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_owned(),
            description: None,
            categories: vec![],
        }
    }

    pub fn from_req(req: CreateRequest) -> Self {
        Self {
            name: req.name,
            description: req.description,
            categories: req.categories,
        }
    }
}

#[derive(thiserror::Error, std::fmt::Debug)]
pub enum CreateError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
}
