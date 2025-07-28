use sqlx::types::chrono;

/*
INSERT INTO your_table (col1, col2)
SELECT *
FROM unnest($1::text[], $2::int[])
ON CONFLICT (col1) DO NOTHING;
 */

#[tracing::instrument(name = "linkdb::category::upsert", skip_all, err)]
pub async fn upsert(
    pool: &sqlx::PgPool,
    rows: Vec<crate::CatRowI>,
    now: chrono::DateTime<chrono::Utc>,
) -> Result<(), sqlx::Error> {
    let names: Vec<_> = rows.iter().map(|r| &r.name).collect();
    let display_name: Vec<_> = rows.iter().map(|r| &r.display_name).collect();
    let description: Vec<_> = rows.iter().map(|r| &r.description).collect();
    let about: Vec<_> = rows.iter().map(|r| &r.about).collect();
    let priority: Vec<_> = rows.iter().map(|r| &r.priority).collect();
    let active: Vec<_> = rows.iter().map(|r| &r.active).collect();
    let public: Vec<_> = rows.iter().map(|r| &r.public).collect();
    let user_id: Vec<_> = rows.iter().map(|r| &r.user_id).collect();

    let query = r#"
        INSERT INTO linknova_category (
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user_id,
            created_on,
            updated_on
        )
        SELECT
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user_id,
            $9,
            $10
        FROM unnest(
            $1::text[],
            $2::text[],
            $3::text[],
            $4::text[],
            $5::int[],
            $6::bool[],
            $7::bool[],
            $8::text[]
        ) AS t(
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user_id
        )
        ON CONFLICT (name, user_id) DO NOTHING;
    "#;

    sqlx::query(query)
        .bind(names)
        .bind(display_name)
        .bind(description)
        .bind(about)
        .bind(priority)
        .bind(active)
        .bind(public)
        .bind(user_id)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

    Ok(())
}

#[tracing::instrument(name = "linkdb::category::insert", skip_all, err)]
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
            user_id,
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
        .bind(row.user_id)
        .bind(now)
        .bind(now)
        .fetch_one(pool)
        .await?;

    Ok((id, name))
}

#[tracing::instrument(name = "linkdb::category::get-by-name", skip_all, err)]
pub async fn get_by_name(
    pool: &sqlx::PgPool,
    user_id: &str,
    cat_name: &str,
) -> Result<Option<crate::CatRow>, sqlx::Error> {
    let query = r#"
        select
            id,
            name,
            display_name,
            description,
            about,
            priority,
            active,
            public,
            user_id,
            created_on,
            updated_on
        FROM linknova_category
        WHERE name = $1 and user_id = $2
    "#;

    sqlx::query_as(query)
        .bind(cat_name)
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

#[tracing::instrument(name = "linkdb::category::get-id-by-name", skip_all, err)]
pub async fn get_id_by_name(
    pool: &sqlx::PgPool,
    user_id: &str,
    cat_name: &str,
) -> Result<Option<i64>, sqlx::Error> {
    let query = r#"
        select id FROM linknova_category
        WHERE name = $1 and user_id = $2
    "#;

    let id: Option<(i64,)> = sqlx::query_as(query)
        .bind(cat_name)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;
    Ok(id.map(|(x,)| x))
}

#[tracing::instrument(name = "linkdb::category::list-all", skip_all, err)]
pub async fn list_all(
    pool: &sqlx::PgPool,
    user_id: &str,
) -> Result<Vec<crate::CategoryRowView>, sqlx::Error> {
    let query = r#"
        select
            id,
            name,
            display_name,
            description,
            priority,
            active,
            public,
            created_on,
            updated_on
        FROM linknova_category
        WHERE user_id = $1
    "#;

    sqlx::query_as(query).bind(user_id).fetch_all(pool).await
}

#[tracing::instrument(name = "linkdb::category::list-by-topic-name", skip_all, err)]
pub async fn list_by_topic_name(
    pool: &sqlx::PgPool,
    user_id: &str,
    topic_names: &[String],
) -> Result<Vec<crate::CategoryRowView>, sqlx::Error> {
    let query = r#"
        select
            cat.id,
            cat.name,
            cat.display_name,
            cat.description,
            cat.priority,
            cat.active,
            cat.public,
            cat.created_on,
            cat.updated_on
        FROM linknova_category as cat
        JOIN linknova_topic_category_map as mapping
            ON cat.id = mapping.category_id
        JOIN linknova_topic as topic
            ON mapping.topic_id = topic.id
        WHERE
            topic.name = ANY($1) AND
            topic.user_id = $2 AND
            cat.user_id = $3
    "#;

    sqlx::query_as(query)
        .bind(topic_names)
        .bind(user_id)
        .bind(user_id)
        .fetch_all(pool)
        .await
}

#[tracing::instrument(name = "linkdb::topic::delete", skip_all, err)]
pub async fn delete(pool: &sqlx::PgPool, user_id: &str, cat_name: &str) -> Result<(), sqlx::Error> {
    let query = r#"
        DELETE FROM linknova_category WHERE name = $1 and user_id = $2 returning id
    "#;
    let (_id,): (i64,) = sqlx::query_as(query)
        .bind(cat_name)
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(())
}
