use crate::router::Ctx;
use sqlx::Row;

#[derive(serde::Deserialize, Debug)]
pub struct GetUrlQuery {
    cat: Option<String>,
    p_no: Option<i64>,
    size: Option<i64>,
}

pub async fn get_urls(
    axum::extract::State(ctx): axum::extract::State<Ctx>,
    axum::extract::Query(query): axum::extract::Query<GetUrlQuery>,
) -> axum::response::Response {
    // get all the category ids from rh cache
    let cats = query
        .cat
        .unwrap_or("".to_string())
        .split(',')
        .flat_map(|c| ctx.category_map.get(c).map(|x| *x))
        .collect::<Vec<i64>>();
    let p_no = query.p_no.unwrap_or(1); // todo: handle the negative case also
    let size = query.size.unwrap_or(10);
    match get_urls_(&ctx, cats, p_no, size).await {
        Ok(r) => super::success(axum::http::StatusCode::OK, r),
        Err(e) => {
            println!("{:?}", e);
            super::error(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "somethings went wrong",
            )
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum GetUrlsError {
    #[error("SQLxError: {}", _0)]
    SQLx(#[from] sqlx::Error),
}

#[derive(serde::Serialize)]
pub struct ListUrlResponse {
    prev: Option<i64>,
    next: Option<i64>,
    rows: Vec<UrlRow>,
}

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct UrlRow {
    pub id: i64,
    pub title: Option<String>,
    pub url: String,
}

pub async fn get_urls_(
    ctx: &Ctx,
    categories: Vec<i64>,
    p_no: i64,
    size: i64,
) -> Result<ListUrlResponse, GetUrlsError> {
    let mut query = r#"
        SELECT
            DISTINCT ON (linknova_bookmark.id) linknova_bookmark.id,
            linknova_bookmark.title,
            linknova_bookmark.url
        FROM
            linknova_bookmark
        JOIN
            linknova_bookmark_category_map ON linknova_bookmark.id = linknova_bookmark_category_map.bookmark_id "#.to_string();
    if !categories.is_empty() {
        query.push_str(
            " where linknova_bookmark_category_map.category_id = ANY($1) and is_active = true ",
        );
        query.push_str(" order by linknova_bookmark.id, created_on DESC OFFSET $2 LIMIT $3");
    } else {
        query.push_str(" where is_active = true ");
        query.push_str(" order by linknova_bookmark.id, created_on DESC OFFSET $1 LIMIT $2");
    }

    let mut db_query = sqlx::query(query.as_str());

    // Note: here the question is how to get the categories of each url
    // one brute force way is, if we get the categories by bookmark.id from db, it is gonna be time consuming
    // another way is to select the category_id from mapping table also in the upper query but it only the category that we are passing
    // but a url can have more category than we are passing
    // better way is to generate the data according to the search engine when someone is inserting the data
    // so let's wait for it now to select the tags/categories

    if !categories.is_empty() {
        db_query = db_query.bind(&categories[..]);
    }

    let offset: i64 = if p_no <= 1 {
        0
    } else {
        ((p_no - 1) * size) - 1
    };

    let rows: Vec<UrlRow> = db_query
        .bind(offset)
        .bind(size + 1)
        .fetch_all(&ctx.db)
        .await?
        .into_iter()
        .map(|r| UrlRow {
            id: r.get(0),
            title: r.get(1),
            url: r.get(2),
        })
        .collect();

    let mut next = None;
    if rows.len() > size as usize {
        next = Some(p_no + 1);
    }

    let mut prev = None;
    if p_no > 1 {
        prev = Some(p_no - 1);
    }

    Ok(ListUrlResponse {
        prev,
        next,
        rows: rows.into_iter().take(size as usize).collect(),
    })
}
