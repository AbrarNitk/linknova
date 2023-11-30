use sqlx::Row;
use crate::router::ApiContext;

#[derive(serde::Deserialize)]
pub struct SaveRequest {
    pub url: String,
    pub app: Option<String>,
    pub categories: Vec<String>,
}

pub async fn save_url(
    axum::extract::State(ctx): axum::extract::State<ApiContext>,
    axum::Json(request): axum::Json<SaveRequest>,
) -> String {

    // request: getting the url and categories
    // get all the categories at runtime and hash-mapped them, with some default value also
    // insert into url table and get the id
    //
    let params = (1..=request.categories.len()).map(|x| format!("${}", x)).collect::<Vec<_>>().join(",");
    let query_str = format!("select id, name from directory where name in ({})", params);
    println!("{}", query_str);
    let mut query = sqlx::query(&query_str);
    for arg in request.categories.iter() {
        query = query.bind(arg);
    }
    use sqlx::Execute;
    let sql = query.sql();
    println!("{}", sql);
    let rows: Vec<(i64, String)> = query.fetch_all(&ctx.db).await.unwrap().into_iter().map(|row| (row.get(0), row.get(1))).collect();

    // let rows = sqlx::query!("select id, name from directory where name in ('default')")
    //     .fetch_all(&ctx.db)
    //     .await.unwrap();

    for (c1, c2) in &rows {
        println!("{}:{}", c1, c2);
    }

    println!("{}", rows.len());

    "url-saved".to_string()
}
