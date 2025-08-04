# LinkNova

LinkNova is a project which manages urls based on the user, topic and categories.

A link can attached to n number of categories and a category can be included in n number of topics.

Here, We have different pages to manage the topic, categories and bookmarks.


## UI

We have web pages to manage the topic, category and bookmarks. In all the web pages,
server sent the html web page from the backend, frontend make api calls to backend 
server to load the show the data on the UI. 


### APIs

All the backend api has the base url as `api-base`: `/-/ln/v1/api` followed by the api based on the 
topic, category or bookmark.


### API Response

All the backend api response are in the below format.

```json
{
    "data": {},// data sent by the server of that api, it cis generic in nature
    "success": bool,
    "error": "string formatted error" 
}
```


## Topic


Topic web page is rendered on the `/-/ln/topic` which sent by the server. After that we list down
all the topics sent by the server by calling an api `/-/ln/v1/api/topic`.


List api get the below topic structure from the backend.

### Topic GET/List Response

Topic struct sent by the server, this is used in the backend get and list api.

```rust
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

```

### Topic Info

On the Topic page we are showing list of topics as topic-card, on click on the topic card we
show all information about the topic, while on the list card we don't have to show all the information.

On this topic info popup we also allow a person to edit the topic details, like topic name cannot be changed,
topic description, display_name, priority, about, public, cateroies can be updated.

For categories they can be added or remove from the topic, to add categories we call `<api-base>/topic/{topic-name}/add-cats`
backend api with data `{ categories: [<list of string>] }` and put method.

For remaining details we call the PUT `<api-base>/topic/{topic-name}` with the below request.

```rust
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
```

### Other Components On the Topic Home Page

- topic list
- topic search by name
- create topic
- on-click topic-card shw the information about the topic
 - on the topic-card we can edit the topic information
 - we can add and remove the categories


 ## Categories

 Categories are same as topic but they are mapped to bookmark. A category can be included in the
 n number of topics and also n number of bookmark.

 Categories are to caategories the url so they become easy to search by caegorization, topics are to
 categories the category.


 ## Category UI

On the category home page we have different components
- listing the categories
- search category by name, filter categories by topic
- create category
- each category-card have its own information with number of topics
  - on the category-card we can edit the category details
  - on the category-card we can see the all the added topics
  - we can remove the topics
  - we can add the topics
- You must be professional UI/UX, add any details if I have missed anything form the UI
  perspective.


## Category API


### UI APIs

Topic home page is rendered with GET `/-/ln/category` url.


### Category Backend API

All the backend apis follows the `api-base`

- List API: GET `/cat`, it returns the list of `CatGetRes`
- GET API: GET `/cat/{cat-name}` it returns `CatGetRes`
- Create API: POST `/cat` it accept `CatCreateReq` as data
- Update API: PUT `/cat/{cat-name}`, it accet the `CatUpdateReq`
- Delete API: DELETE `/cat/{cat-name}`
- Add categories: PUT `/cat/{cat-name}`, it accepts data as `{ "topics": [<list of topic name>] }`
- Add categories: DELETE `/cat/{cat-name}`, it accepts data as `{ "topics": [<list of topic name>] }`


```rust
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
    pub topics: Vec<String>
}

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

#[derive(serde::Deserialize)]
pub struct CatUpdateReq {
    pub display_name: Option<String>,
    pub about: Option<String>,
    pub description: Option<String>,
    pub public: Option<bool>,
    pub priority: Option<i32>,
}

```