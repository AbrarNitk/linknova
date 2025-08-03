#[tracing::instrument(name = "linkdb::connect-topic-category")]
pub async fn connect(
    pool: &sqlx::PgPool,
    topic_id: i64,
    category_id: i64,
) -> Result<(), sqlx::Error> {
    let query = r#"
        INSERT INTO linknova_topic_category_map(
            topic_id, category_id
        ) VALUES($1, $2)
        "#;

    let result = sqlx::query(query)
        .bind(topic_id)
        .bind(category_id)
        .execute(pool)
        .await?;
    assert_eq!(result.rows_affected(), 1);
    Ok(())
}

#[tracing::instrument(name = "linkdb::topic-cat-map::remove")]
pub async fn delete(
    pool: &sqlx::PgPool,
    topic_id: i64,
    category_id: i64,
) -> Result<(), sqlx::Error> {
    let query = r#"
            DELETE FROM linknova_topic_category_map
            WHERE topic_id = $1 AND category_id = $2
        "#;

    sqlx::query(query)
        .bind(topic_id)
        .bind(category_id)
        .execute(pool)
        .await?;
    Ok(())
}

#[tracing::instrument(name = "linkdb::topic::cat-map::add-categories", skip_all, err)]
pub async fn add_categories(
    tx: &mut sqlx::PgTransaction<'_>,
    topic_id: i64,
    categories: &[i64],
) -> Result<(), sqlx::Error> {
    // Build a Vec with topic_id repeated for each category
    let topic_ids: Vec<i64> = std::iter::repeat(topic_id).take(categories.len()).collect();

    let query = r#"
        INSERT INTO linknova_topic_category_map (topic_id, category_id)
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

#[tracing::instrument(name = "linkdb::topic::cat-map::remove-categories", skip_all, err)]
pub async fn remove_categories(
    pool: &sqlx::PgPool,
    topic_id: i64,
    categories: &[String],
) -> Result<(), sqlx::Error> {
    let query = r#"
        DELETE from linknova_topic_category_map as mapping
        USING linknova_category as cat
        WHERE
            cat.id = mapping.category_id
            AND mapping.topic_id = $1
            AND cat.name = ANY($2)
    "#;

    sqlx::query(query)
        .bind(topic_id)
        .bind(categories)
        .execute(pool)
        .await?;

    Ok(())
}
