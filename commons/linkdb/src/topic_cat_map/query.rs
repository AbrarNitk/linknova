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

pub async fn remove(
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
