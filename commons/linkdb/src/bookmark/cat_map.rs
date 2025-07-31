#[tracing::instrument(name = "linkdb::bookmark::cat-map::add-categories", skip_all, err)]
pub async fn add_categories(
    tx: &mut sqlx::PgTransaction<'_>,
    bookmark_id: i64,
    categories: &[i64],
) -> Result<(), sqlx::Error> {
    // Build a Vec with topic_id repeated for each category
    let topic_ids: Vec<i64> = std::iter::repeat(bookmark_id)
        .take(categories.len())
        .collect();

    let query = r#"
        INSERT INTO linknova_bookmark_category_map (bookmark_id, category_id)
        SELECT * FROM
            unnest($1::bigint[], $2::bigint[])
        ON CONFLICT DO NOTHING
    "#;

    sqlx::query(query)
        .bind(&topic_ids)
        .bind(categories)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

#[tracing::instrument(name = "linkdb::bookmark::cat-map::remove-categories", skip_all, err)]
pub async fn remove_categories(
    pool: &sqlx::PgPool,
    bm_id: i64,
    categories: &[String],
) -> Result<(), sqlx::Error> {
    let query = r#"
        DELETE from linknova_bookmark_category_map as mapping
        JOIN linknova_category as cat
        ON cat.id = mapping.category_id
        WHERE mapping.bookmark_id = $1 AND cat.name = ANY($1)
    "#;

    sqlx::query(query)
        .bind(bm_id)
        .bind(categories)
        .execute(pool)
        .await?;

    Ok(())
}

#[tracing::instrument(name = "linkdb::bookmark::cat-map::delete-by-bm-id", skip_all, err)]
pub async fn delete_by_bookmark_id(
    tx: &mut sqlx::PgTransaction<'_>,
    topic_id: i64,
) -> Result<(), sqlx::Error> {
    let query = r#"delete from linknova_bookmark_category_map where bookmark_id = $1"#;
    sqlx::query(query).bind(topic_id).execute(&mut **tx).await?;

    Ok(())
}
