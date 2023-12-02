pub mod apis;
pub mod controller;
pub mod router;

#[derive(thiserror::Error, Debug)]
pub enum HNError {}
