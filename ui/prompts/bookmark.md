# Bookmarks

Bookmark are the url are being saved in the backend system with the categories, these categories can
also be available in the system or they can be newly created if they come in the bookmark request.

In the backend api we create the bookmark and also we link bookmark with the category.


## UI

On the home page we list all the bookmarks and then provides the below functionality

On the UI we should be able to

- search by category
- search by topic
- search by title, url, host and all
- create bookmark
- edit bookmark, mostly all the fields are editable
- add/remove categories
- delete bookmark


## APIs

All the api follow the base `/-/ln/v1/api/`


All the responses follow the same below structure.

```json
{
    "data": ggeneric data
    "success": bool,
    "error": string formated string
}
```

### Create Bookmark

- API: POST `/bm`

Below is request body

```rust
#[derive(serde::Deserialize, Debug)]
pub struct BmCreateReq {
    pub title: Option<String>,
    pub url: String,
    pub content: Option<String>,
    pub referrer: Option<String>,
    pub status: Option<String>,
    pub categories: Vec<String>,
}
```

Response comes as empty response with the created status.


### List Bookrmarks

- API: GET `/bm

on the list show the categories as well....

Response are the list of below struct...


```rust
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

```


### GET Bookmark

- API GET: `/bm/{id}


Response:

```rust
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
```

### Add Categories

- API: PUT `/bm/add-cats/{id}`

```rust
#[derive(serde::Deserialize, Debug)]
pub struct AddCategories {
    pub categories: Vec<String>,
}
```


### Remove Categories

- API: DELETE `/bm/remove-cats/{id}`

```rust
#[derive(serde::Deserialize, Debug)]
pub struct RemoveCategories {
    pub categories: Vec<String>,
}
```


### Delete Bookmark

- API: DELETE `/bm/{id}`


