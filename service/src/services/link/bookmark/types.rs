use crate::controller::link::types;

#[derive(thiserror::Error, Debug)]
pub enum BookmarkError {
    #[error("DatabaseError: {0}")]
    Database(#[from] sqlx::Error),
    #[error("NotFoundError: {0}")]
    NotFound(String),
}

pub fn from_req(
    req: types::BmCreateReq,
    user_id: &str,
    now: chrono::DateTime<chrono::Utc>,
) -> linkdb::bookmark::BookmarkI {
    linkdb::bookmark::BookmarkI {
        url: req.url,
        user_id: user_id.to_string(),
        title: req.title,
        content: req.content,
        referrer: req.referrer,
        status: req.status.unwrap_or_else(|| "UN".to_string()),
        created_on: now,
        updated_on: now,
    }
}
