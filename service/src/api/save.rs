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
    "url-saved".to_string()
}
