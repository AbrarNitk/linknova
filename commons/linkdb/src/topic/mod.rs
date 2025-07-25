pub mod query;
pub mod types;

pub use query::{delete, get_by_name, get_id_by_name, insert, list_all, list_by_cat_name};
pub use types::{TopicRow, TopicRowI, TopicRowView};
