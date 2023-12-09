#[derive(serde::Deserialize)]
pub struct HNItem {
    pub id: i64,
    pub by: Option<String>,
    pub time: Option<u64>,
    pub text: Option<String>,
    pub parent: Option<i64>,
    pub kids: Vec<i64>,
    pub url: Option<String>,
    pub score: Option<String>,
    pub title: Option<String>,
}

pub async fn get_item(item_id: &i64) -> Result<HNItem, super::HNError> {
    let url = format!(
        "https://hacker-news.firebaseio.com/v0/item/{}.json",
        item_id
    );
    Ok(crate::utils::http::get(&url, &Default::default()).await?)
}

pub async fn get_items(item_ids: &[i64]) -> Result<Vec<HNItem>, super::HNError> {
    // call hn to get the item
    Ok(vec![HNItem {
        id: 0,
        by: None,
        time: None,
        text: None,
        parent: None,
        kids: vec![],
        url: None,
        score: None,
        title: None,
    }])
}

#[derive(serde::Serialize)]
pub struct HNUserDetails {}

pub async fn users(username: &str) -> Result<HNUserDetails, super::HNError> {
    Ok(HNUserDetails {})
}

pub async fn max_item_id() -> Result<i64, super::HNError> {
    Ok(1)
}

#[derive(serde::Serialize)]
pub struct TopStory {}

pub async fn top_stories() -> Result<Vec<TopStory>, super::HNError> {
    Ok(vec![TopStory {}])
}

#[derive(serde::Serialize)]
pub struct AskStory {}

pub async fn ask_stories() -> Result<Vec<AskStory>, super::HNError> {
    Ok(vec![AskStory {}])
}
