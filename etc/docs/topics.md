# Topic

Topic is a general categorization of the categories/label/tags.

There will be an un-managed topic per user.

## APIs


### Create Topic

- POST: /links/-/topic/
- Request
```json
{
  "name": "topic-name and others",
  "display_name": "title of the topic",
  "description": "an optional description",
  "priority": 1,
  "user": "user-id in string format",
  "public": "bool: tells whether it is public or not"
}
```

### Get Topic

- GET /links/-/topic/{topic-name}

### List Topic

- GET /links/-/topic

### Update Topic

- PUT: /links/-/topic/
- Request
```json
{
  "name": "topic-name and others",
  "display_name": "title of the topic",
  "description": "an optional description",
  "priority": 1,
  "user": "user-id in string format",
  "public": "bool: tells whether it is public or not"
}
```


### Delete Topic

- DELETE /links/-/topic/{name}


### Add category to a topic 

### Remove a category from topic

