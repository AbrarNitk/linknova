use crate::controller::link::types;
use linkdb::category::CatRowI;

#[derive(thiserror::Error, Debug)]
pub enum CatError {
    #[error("DatabaseError: {0}")]
    Database(#[from] sqlx::Error),
    #[error("NotFoundError: {0}")]
    NotFound(String),
}

pub fn from_cat_name(name: &str, user_id: &str) -> CatRowI {
    CatRowI {
        name: name.to_string(),
        display_name: None,
        description: None,
        about: None,
        priority: 0,
        active: true,
        public: false,
        user_id: user_id.to_string(),
    }
}

pub fn from_req(req: types::CatCreateReq, user_id: &str) -> CatRowI {
    CatRowI {
        name: req.name,
        display_name: req.display_name,
        description: req.description,
        about: req.about,
        priority: 0,
        active: true,
        public: req.public,
        user_id: user_id.to_string(),
    }
}
