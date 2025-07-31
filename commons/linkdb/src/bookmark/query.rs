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
            b.id,
            b.url,
            b.user_id,
            b.title,
            b.content,
            b.referrer,
            b.status,
            b.created_on,
            b.updated_on,
            COALESCE(
                ARRAY_AGG(cat.name ORDER BY cat.name) FILTER (WHERE cat.name IS NOT NULL),
                '{}'
            ) AS categories
        FROM linknova_bookmark as b
        LEFT JOIN linknova_bookmark_category_map as mapping ON b.id = mapping.bookmark_id
        LEFT JOIN linknova_category as cat ON mapping.category_id = cat.id
        WHERE b.id = $1
        GROUP by b.id
    "#;

    let row = sqlx::query_as(query).bind(id).fetch_one(pool).await?;
    Ok(row)
}

#[tracing::instrument(name = "linkdb::bookmark::filter", skip_all, err)]
pub async fn filter(
    pool: &sqlx::PgPool,
    user_id: &str,
    categories: Option<&[String]>,
    status: &Option<String>,
) -> Result<Vec<BookmarkRow>, sqlx::Error> {
    let mut qb = sqlx::query_builder::QueryBuilder::new(
        r#"
        SELECT
            b.id,
            b.url,
            b.user_id,
            b.title,
            b.content,
            b.referrer,
            b.status,
            b.created_on,
            b.updated_on,
            COALESCE(
                ARRAY_AGG(cat.name ORDER BY cat.name) FILTER (WHERE cat.name IS NOT NULL),
                '{}'
            ) AS categories

        FROM linknova_bookmark as b
        LEFT JOIN linknova_bookmark_category_map as mapping ON b.id = mapping.bookmark_id
        LEFT JOIN linknova_category as cat ON mapping.category_id = cat.id
        WHERE
    "#,
    );

    qb.push(" b.user_id = ");
    qb.push_bind(user_id);

    if let Some(status) = status {
        qb.push(" AND b.status = ");
        qb.push_bind(status);
    }

    qb.push(" GROUP by b.id");

    // Use a HAVING clause to filter based on the aggregated categories.
    if let Some(categories) = categories {
        if !categories.is_empty() {
            // This checks if any of the bookmark's categories are in the provided list.
            qb.push(" HAVING bool_or(cat.name = ANY(");
            qb.push_bind(categories);
            qb.push("))");
        }
    }

    let row = qb.build_query_as().fetch_all(pool).await?;
    Ok(row)
}

#[tracing::instrument(name = "linkdb::bookmark::filter", skip_all, err)]
pub async fn filter_by_topic(
    pool: &sqlx::PgPool,
    user_id: &str,
    topic_name: &str,
    categories: Option<&[String]>,
    status: &Option<String>,
) -> Result<Vec<BookmarkRow>, sqlx::Error> {
    // This is the base query for selecting bookmark data and ALL its categories.
    // The filtering is handled separately below.
    let mut qb = sqlx::query_builder::QueryBuilder::new(
        r#"
        SELECT
            b.id,
            b.url,
            b.user_id,
            b.title,
            b.content,
            b.referrer,
            b.status,
            b.created_on,
            b.updated_on,
            COALESCE(
                ARRAY_AGG(cat.name ORDER BY cat.name) FILTER (WHERE cat.name IS NOT NULL),
                '{}'
            ) AS categories
        FROM linknova_bookmark as b
        LEFT JOIN linknova_bookmark_category_map as bcm ON b.id = bcm.bookmark_id
        LEFT JOIN linknova_category as cat ON bcm.category_id = cat.id
        WHERE
    "#,
    );

    qb.push(" b.user_id = ");
    qb.push_bind(user_id);

    // Use an EXISTS subquery to check for a path to the topic without affecting the main JOINs.
    qb.push(" AND EXISTS (SELECT 1 FROM linknova_topic_category_map tcm JOIN linknova_topic t ON tcm.topic_id = t.id WHERE tcm.category_id = bcm.category_id AND t.name = ");
    qb.push_bind(topic_name);
    qb.push(")");

    // The optional status filter is a simple WHERE condition.
    if let Some(status) = status {
        qb.push(" AND b.status = ");
        qb.push_bind(status);
    }

    qb.push(" GROUP BY b.id");

    // Use a HAVING clause to filter based on the aggregated categories.
    if let Some(categories) = categories {
        if !categories.is_empty() {
            // This checks if any of the bookmark's categories are in the provided list.
            qb.push(" HAVING bool_or(cat.name = ANY(");
            qb.push_bind(categories);
            qb.push("))");
        }
    }

    let row = qb.build_query_as().fetch_all(pool).await?;
    Ok(row)
}

pub async fn delete_by_id(tx: &mut sqlx::PgTransaction<'_>, id: i64) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM linknova_bookmark WHERE id = $1")
        .bind(id)
        .execute(&mut **tx)
        .await?;
    Ok(())
}
