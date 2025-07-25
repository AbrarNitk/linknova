#[derive(serde::Deserialize)]
pub struct CatCreateReq {
    pub name: String,
    pub display_name: Option<String>,
    pub about: Option<String>,
    pub description: Option<String>,
    #[serde(default)]
    pub public: bool,
    #[serde(default)]
    pub priority: i32,
}

#[derive(serde::Serialize)]
pub struct CatGetRes {
    pub name: String,
    pub display_name: Option<String>,
    pub about: Option<String>,
    pub description: Option<String>,
    #[serde(default)]
    pub public: bool,
    #[serde(default)]
    pub priority: i32,
    pub created_on: chrono::DateTime<chrono::Utc>,
    pub updated_on: chrono::DateTime<chrono::Utc>,
}
