#[derive(serde::Serialize)]
pub struct HNItem {}

pub async fn get_item(item_id: &i64) -> Result<HNItem, super::HNError> {
    // call hn to get the item
    Ok(HNItem {})
}


pub async fn get_items(item_ids: &[i64]) -> Result<Vec<HNItem>, super::HNError> {
    // call hn to get the item
    Ok(vec![HNItem {}])
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


