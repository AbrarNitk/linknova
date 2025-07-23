use sqlx::types::chrono;

pub async fn insert(
    pool: &sqlx::PgPool,
    row: crate::CatRowI,
) -> Result<(i64, String), sqlx::Error> {
    let query = r#"
        INSERT INTO linknova_category(
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user,
            created_on,
            updated_on
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
            id, name
    "#;

    let now = chrono::Utc::now();

    let (id, name): (i64, String) = sqlx::query_as(query)
        .bind(row.name)
        .bind(row.display_name)
        .bind(row.description)
        .bind(row.about)
        .bind(row.priority)
        .bind(row.active)
        .bind(row.public)
        .bind(row.user)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;

    Ok((id, name))
}

#[tracing::instrument(name = "linkdb::category::get-by-name", skip_all, err)]
pub async fn get_by_name(
    pool: &sqlx::PgPool,
    name: &str,
) -> Result<Option<crate::CatRow>, sqlx::Error> {
    let query = r#"
        select
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user,
            created_on,
            updated_on
        FROM linknova_category
        WHERE name = $1
    "#;

    sqlx::query_as(query).bind(name).fetch_optional(pool).await
}

#[tracing::instrument(name = "linkdb::category::list-all", skip_all, err)]
pub async fn list_all(
    pool: &sqlx::PgPool,
    name: &str,
) -> Result<Vec<crate::CategoryRowView>, sqlx::Error> {
    let query = r#"
        select
            name,
            display_name,
            description,
            priority,
            active,
            public,
            created_on,
            updated_on
        FROM linknova_category
    "#;

    sqlx::query_as(query).bind(name).fetch_all(pool).await
}

#[tracing::instrument(name = "linkdb::topic::delete", skip_all, err)]
pub async fn delete(pool: &sqlx::PgPool, name: &str) -> Result<(), sqlx::Error> {
    let query = r#"
        DELETE FROM linknova_category WHERE name = $1 returning id
    "#;

    let (_id,): (i64,) = sqlx::query_as(query).bind(name).fetch_one(pool).await?;
    Ok(())
}
