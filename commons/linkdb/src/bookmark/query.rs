use crate::bookmark::{BookmarkI, BookmarkView};

#[tracing::instrument(name = "linkdb::bookmark::insert", skip_all, err)]
pub async fn insert(pool: &sqlx::PgPool, row: BookmarkI) -> Result<i64, sqlx::Error> {
    let query = r#"
        INSERT INTO linknova_bookmark(
            url,
            user_id,
            title,
            content,
            referrer,
            status,
            created_on,
            updated_on
        )VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id;
    "#;

    let (id,): (i64,) = sqlx::query_as(query)
        .bind(row.url)
        .bind(row.user_id)
        .bind(row.title)
        .bind(row.content)
        .bind(row.referrer)
        .bind(row.status)
        .bind(row.created_on)
        .bind(row.updated_on)
        .fetch_one(pool)
        .await?;

    Ok(id)
}
