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

    if !req.categories.is_empty() {
        let cats = req
            .categories
            .iter()
            .map(|name| super::category::Category::new(name, topic_id))
            .collect::<Vec<_>>();
        super::category::upsert_categories(pool, &cats).await?;
    }

    Ok(topic_id)
}

#[derive(thiserror::Error, std::fmt::Debug)]
pub enum CreateError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
}
