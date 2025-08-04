#[derive(serde::Deserialize)]
pub struct TopicCreateReq {
    pub name: String,
    pub description: Option<String>,
    pub display_name: Option<String>,
    pub priority: Option<i32>,
    pub about: Option<String>,
    #[serde(default)]
    pub public: bool,
}

#[derive(serde::Serialize)]
pub struct TopicGetRes {
    pub name: String,
    pub description: Option<String>,
    pub display_name: Option<String>,
    pub priority: i32,
    pub about: Option<String>,
    pub public: bool,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
    pub categories: Vec<String>,
}

#[derive(serde::Deserialize)]
pub struct TopicUpdateReq {
    pub description: Option<String>,
    pub display_name: Option<String>,
    pub priority: Option<i32>,
    pub about: Option<String>,
    pub public: Option<bool>,
}
