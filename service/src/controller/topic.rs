use crate::Ctx;
use axum::extract::path::Path;

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

pub async fn get(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    Path(topic_id): Path<i64>,
) -> axum::response::Response {
    match get_by_id(&ctx.db, topic_id).await {
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

pub async fn get_with_name(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    Path(topic_name): Path<String>,
) -> axum::response::Response {
    match get_by_name(&ctx.db, &topic_name).await {
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
        let cats = super::category::upsert_categories(pool, &cats).await?;
        let topic_cat_ids_map = cats
            .into_iter()
            .map(|(_name, id)| (topic_id, id))
            .collect::<Vec<_>>();
        topic_cat_map(pool, &topic_cat_ids_map).await?;
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

// map: (topic_id, category_id)
pub async fn topic_cat_map(pool: &sqlx::PgPool, map: &[(i64, i64)]) -> sqlx::Result<()> {
    let query = r#"
            INSERT into linknova_topic_category_map(topic_id, category_id)
            SELECT * from UNNEST($1, $2)
            ON CONFLICT (topic_id, category_id) DO NOTHING
            RETURNING id
    "#;
    sqlx::query(query)
        .bind(map.iter().map(|x| x.0).collect::<Vec<_>>())
        .bind(map.iter().map(|x| x.1).collect::<Vec<_>>())
        .execute(pool)
        .await?;
    Ok(())
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

#[derive(sqlx::FromRow, serde::Serialize, Debug)]
pub struct TopicRow {
    pub topic_id: i64,
    pub topic_name: String,
    pub topic_description: Option<String>,
    pub topic_is_active: bool,
    pub categories: serde_json::Value,
}

pub async fn get_by_id(pool: &sqlx::PgPool, id: i64) -> Result<Vec<TopicRow>, sqlx::Error> {
    let query = r#"
        SELECT
            topic.id as topic_id,
            topic.name as topic_name,
            topic.description as topic_description,
            topic.is_active as topic_is_active,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'category_id', category.id,
                        'category_name', category.name,
                        'category_title', category.title,
                        'category_about', category.about
                    )
                ) FILTER (WHERE category.id IS NOT NULL), '[]'::jsonb
            ) AS categories
        FROM
            linknova_topic as topic
        LEFT JOIN
            linknova_topic_category_map ON topic.id = linknova_topic_category_map.topic_id
        LEFT JOIN
            linknova_category as category ON category.id = linknova_topic_category_map.category_id
        WHERE
            topic.id = $1
        GROUP BY
            topic.id, topic.name, topic.description, topic.is_active;
        "#;

    let topic_categories: Vec<TopicRow> = sqlx::query_as(query).bind(id).fetch_all(pool).await?;
    Ok(topic_categories)
}

pub async fn get_by_name(pool: &sqlx::PgPool, name: &str) -> Result<Vec<TopicRow>, sqlx::Error> {
    let query = r#"
        SELECT
            topic.id as topic_id,
            topic.name as topic_name,
            topic.description as topic_description,
            topic.is_active as topic_is_active,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'category_id', category.id,
                        'category_name', category.name,
                        'category_title', category.title,
                        'category_about', category.about
                    )
                ) FILTER (WHERE category.id IS NOT NULL), '[]'::jsonb
            ) AS categories
        FROM
            linknova_topic as topic
        LEFT JOIN
            linknova_topic_category_map ON topic.id = linknova_topic_category_map.topic_id
        LEFT JOIN
            linknova_category as category ON category.id = linknova_topic_category_map.category_id
        WHERE
            topic.name = $1
        GROUP BY
            topic.id, topic.name, topic.description, topic.is_active;
        "#;

    let topic_categories: Vec<TopicRow> = sqlx::query_as(query).bind(name).fetch_all(pool).await?;
    Ok(topic_categories)
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
