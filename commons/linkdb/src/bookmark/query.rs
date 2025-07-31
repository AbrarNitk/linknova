use crate::bookmark::{BookmarkI, BookmarkRow};

#[tracing::instrument(name = "linkdb::bookmark::insert", skip_all, err)]
pub async fn insert(tx: &mut sqlx::PgTransaction<'_>, row: BookmarkI) -> Result<i64, sqlx::Error> {
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
        .fetch_one(&mut **tx)
        .await?;

    Ok(id)
}

#[tracing::instrument(name = "linkdb::bookmark::get", skip_all, err)]
pub async fn get_by_id(pool: &sqlx::PgPool, id: i64) -> Result<BookmarkRow, sqlx::Error> {
    let query = r#"
        SELECT
            id,
            url,
            user_id,
            title,
            content,
            referrer,
            status,
            created_on,
            updated_on
        FROM linknova_bookmark
        WHERE id = $1
    "#;

    let row = sqlx::query_as(query).bind(id).fetch_one(pool).await?;
    Ok(row)
}

#[tracing::instrument(name = "linkdb::bookmark::filter", skip_all, err)]
pub async fn filter(pool: &sqlx::PgPool, user_id: &str) -> Result<Vec<BookmarkRow>, sqlx::Error> {
    let query = r#"
        SELECT
            id,
            url,
            user_id,
            title,
            content,
            referrer,
            status,
            created_on,
            updated_on
        FROM linknova_bookmark
        WHERE user_id = $1
    "#;

    let row = sqlx::query_as(query).bind(user_id).fetch_all(pool).await?;
    Ok(row)
}

pub async fn delete_by_id(tx: &mut sqlx::PgTransaction<'_>, id: i64) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM linknova_bookmark WHERE id = $1")
        .bind(id)
        .execute(&mut **tx)
        .await?;
    Ok(())
}
