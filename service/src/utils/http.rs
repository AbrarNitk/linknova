use std::str::FromStr;

#[derive(thiserror::Error, Debug)]
pub enum ReqwestError {
    #[error("ReqwestError: {}", _0)]
    Reqwest(#[from] reqwest::Error),
    #[error("ReqwestInvalidHeaderValueError: {}", _0)]
    ReqwestInvalidHeaderV(#[from] reqwest::header::InvalidHeaderValue),
    #[error("ReqwestInvalidHeaderNameError: {}", _0)]
    ReqwestInvalidHeaderN(#[from] reqwest::header::InvalidHeaderName),
}

pub async fn get<T: serde::de::DeserializeOwned>(
    url: &str,
    headers: &std::collections::HashMap<String, String>,
) -> Result<T, ReqwestError> {
    let client = reqwest::Client::builder().build()?;
    let mut headers_map = reqwest::header::HeaderMap::<reqwest::header::HeaderValue>::new();
    for (k, v) in headers.into_iter() {
        headers_map.insert(
            reqwest::header::HeaderName::from_bytes(k.as_bytes())?,
            reqwest::header::HeaderValue::from_str(v.as_str())?,
        );
    }
    let response: T = client
        .get(url)
        .headers(headers_map)
        .send()
        .await?
        .json()
        .await?;
    Ok(response)
}

pub async fn post() -> Result<(), ()> {
    Ok(())
}
