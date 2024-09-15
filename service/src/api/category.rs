#[derive(Debug)]
pub struct Category {
    pub name: String,
    pub title: Option<String>,
    pub about: Option<String>,
    pub topic: i64,
}

impl Category {
    pub fn new(name: &str, topic_id: i64) -> Self {
        Self {
            name: name.to_owned(),
            topic: topic_id,
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
        INSERT INTO linknova_category(name, title, about, topic_id, created_on, updated_on)
        values($1, $2, $3, $4, $5, $6)
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
            .bind(&cat.topic)
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
