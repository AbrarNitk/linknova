#[derive(serde::Deserialize, Debug)]
pub struct BmCreateReq {
    pub title: Option<String>,
    pub url: String,
    pub content: Option<String>,
    pub referrer: Option<String>,
    pub status: Option<String>,
    pub categories: Vec<String>,
}

#[derive(serde::Serialize, Debug)]
pub struct BmResponse {
    pub id: i64,
    pub url: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub referrer: Option<String>,
    pub status: String,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
    pub categories: Vec<String>,
}

#[derive(serde::Deserialize, Debug)]
pub struct AddCategories {
    pub categories: Vec<String>,
}

#[derive(serde::Deserialize, Debug)]
pub struct RemoveCategories {
    pub categories: Vec<String>,
}
