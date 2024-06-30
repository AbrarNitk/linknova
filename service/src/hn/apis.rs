#[derive(serde::Deserialize, serde::Serialize)]
pub struct HNItem {
    pub id: i64,
    pub by: Option<String>,
    pub r#type: Option<String>,
    pub time: Option<u64>,
    pub text: Option<String>,
    pub parent: Option<i64>,
    pub kids: Option<Vec<i64>>,
    pub url: Option<String>,
    pub score: Option<u64>,
    pub title: Option<String>,
}

pub async fn get_item(item_id: i64) -> Result<HNItem, super::HNError> {
    let url = format!(
        "https://hacker-news.firebaseio.com/v0/item/{}.json",
        item_id
    );
    Ok(crate::utils::http::get(&url, &Default::default()).await?)
}

pub async fn get_items(item_ids: &[i64]) -> Result<Vec<HNItem>, super::HNError> {
    // call hn to get the item
    let mut future_apis = vec![];
    for id in item_ids {
        future_apis.push(get_item(*id));
    }
    let response = futures::future::try_join_all(future_apis).await?;
    Ok(response)
}

pub async fn max_item_id() -> Result<i64, super::HNError> {
    Ok(1)
}

#[derive(serde::Serialize)]
pub struct TopStory {
    items: Vec<HNItem>,
}

pub async fn top_stories() -> Result<Vec<TopStory>, super::HNError> {
    let url = "https://hacker-news.firebaseio.com/v0/newstories.json";
    let items_ids: Vec<i64> = crate::utils::http::get(&url, &Default::default()).await?;
    let items = get_items(items_ids.as_slice()).await?;
    Ok(vec![TopStory { items }])
}

#[derive(serde::Serialize)]
pub struct AskStory {
    items: Vec<HNItem>,
}

pub async fn ask_stories() -> Result<Vec<AskStory>, super::HNError> {
    let url = "https://hacker-news.firebaseio.com/v0/askstories.json";
    let items_ids: Vec<i64> = crate::utils::http::get(&url, &Default::default()).await?;
    let items = get_items(items_ids.as_slice()).await?;
    Ok(vec![AskStory { items }])
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct HNUserDetails {
    pub about: Option<String>,
    pub created: u64,
    pub id: String,
    pub karma: Option<i32>,
    pub submitted: Option<Vec<i64>>,
}

pub async fn user_details(username: &str) -> Result<HNUserDetails, super::HNError> {
    let url = format!(
        " https://hacker-news.firebaseio.com/v0/user/{}.json",
        username.trim()
    );
    let user_details: HNUserDetails = crate::utils::http::get(&url, &Default::default()).await?;
    Ok(user_details)
}
