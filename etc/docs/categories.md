# Categories

Category aliases to label or tags in the system. A category can be included in more than one
topic.


## APIs


### Create Category

- POST: /links/-/cat/
- Request
```json
{
  "name": "cat-name and others",
  "display_name": "title of the category",
  "description": "an optional description",
  "about": "about the category",
  "priority": 1,
  "user": "user-id in string format",
  "public": "bool: tells whether it is public or not",
  "topics": ["topic-name-1"]
}
```

### Get Categoies

- queries
    - by default list all the categories
    - list of topics
    - or a single topic

- GET /links/-/cat/{topic-name}/{cat-name}


### List Topic

- GET /links/-/cat/{topic-name}

### Update Topic

- PUT: /links/-/cat/
- Request
```json
{
  "name": "cat-name and others",
  "display_name": "title of the category",
  "description": "an optional description",
  "about": "about the category",
  "priority": 1,
  "user": "user-id in string format",
  "public": "bool: tells whether it is public or not",
  "topics": ["topic-name-1"]
}
```


### Delete Topic

- DELETE /links/-/topic/{name}
