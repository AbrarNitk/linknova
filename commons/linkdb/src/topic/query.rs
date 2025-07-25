use crate::TopicRowView;
use crate::topic::types;
use sqlx::types::chrono;

#[tracing::instrument(name = "linkdb::topic::insert", skip_all, err)]
pub async fn insert(
    pool: &sqlx::PgPool,
    row: types::TopicRowI,
) -> Result<(i64, String), sqlx::Error> {
    let query = r#"
        INSERT INTO linknova_topic(
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

#[tracing::instrument(name = "linkdb::topic::get-by-name", skip_all, err)]
pub async fn get_by_name(
    pool: &sqlx::PgPool,
    user_id: &str,
    name: &str,
) -> Result<Option<types::TopicRow>, sqlx::Error> {
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
        FROM linknova_topic
        WHERE name = $1 AND user_id = $2
    "#;

    sqlx::query_as(query)
        .bind(name)
        .bind(user_id)
        .fetch_optional(pool)
        .await
}

#[tracing::instrument(name = "linkdb::topic::list-all", skip_all, err)]
pub async fn list_all(
    pool: &sqlx::PgPool,
    user_id: &str,
) -> Result<Vec<types::TopicRowView>, sqlx::Error> {
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
        FROM linknova_topic
        WHERE user_id = $1
    "#;

    sqlx::query_as(query).bind(user_id).fetch_all(pool).await
}

#[tracing::instrument(name = "linkdb::topic::list-by-cat-name", skip_all, err)]
pub async fn list_by_cat_name(
    pool: &sqlx::PgPool,
    cat_names: &[String],
    user_id: &str,
) -> Result<Vec<TopicRowView>, sqlx::Error> {
    let query = r#"
        SELECT
            topic.name,
            topic.display_name,
            topic.description,
            topic.priority,
            topic.active,
            topic.public,
            topic.created_on,
            topic.updated_on
        FROM linknova_topic as topic
        JOIN linknova_topic_category_map as mapping
            ON topic.id = mapping.topic_id
        JOIN linknova_category as category
            ON mapping.category_id = category.id
        WHERE
            topic.user_id = $1 AND
            category.user_id = $2 AND
            category.name = ANY($1)
    "#;

    sqlx::query_as(query)
        .bind(user_id)
        .bind(user_id)
        .bind(cat_names)
        .fetch_all(pool)
        .await
}

#[tracing::instrument(name = "linkdb::topic::delete", skip_all, err)]
pub async fn delete(
    pool: &sqlx::PgPool,
    user_id: &str,
    topic_name: &str,
) -> Result<(), sqlx::Error> {
    let query = r#"
        DELETE FROM linknova_topic WHERE name = $1 user_id = $2 returning id
    "#;

    let (_id,): (i64,) = sqlx::query_as(query)
        .bind(topic_name)
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(())
}
