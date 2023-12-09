# News Application

- Build a new application based on user profile
- Show many adds to user with the news

## Hacker News APIs

- https://github.com/HackerNews/API
    - https://hackernews.api-docs.io/v0/items/get-by-id
- https://news.ycombinator.com/item?id=32540883
- https://hn.algolia.com/api

## Hacker News

In this application we are going to the integration with the hacker-news apis

### Items

There are different types of the items on `hn`, stories, comment, jobs, Ask Hn and even polls are also items.

API to get the item:

```shell
https://hacker-news.firebaseio.com/v0/item/38498069.json?print=pretty
```

- `id`: Item ID
- `type`: job, story, comment, poll or pollopt
- `by`: username of items' author
- `time`: creation date of the item Unix Time
- `text`: comment, story, or poll text: HTML
- `dead`: if item is dead
- `parent`: the comments parent, either another comment or relevant story.
- `kids`: The ids of the items comments
- `url`: url of the story
- `score`: the stories score
- `title`: title of the story

#### Story Response

```json
{
  "id": 8863,
  "by": "dhouston",
  "descendants": 71,
  "kids": [
    8952,
    9224,
    "..."
  ],
  "score": 111,
  "time": 1175714200,
  "title": "My YC app: Dropbox - Throw away your USB drive",
  "type": "story",
  "url": "http://www.getdropbox.com/u/2/screencast.html"
}
```

### Comment

```json
{
  "by": "norvig",
  "id": 2921983,
  "kids": [
    2922097,
    2922429,
    2924562,
    2922709,
    2922573,
    2922140,
    2922141
  ],
  "parent": 2921506,
  "text": "Aw shucks, guys ... you make me blush with your compliments.<p>Tell you what, Ill make a deal: I'll keep writing if you keep reading. K?",
  "time": 1314211127,
  "type": "comment"
}
```

### Ask Response

```json
{
  "by": "tel",
  "descendants": 16,
  "id": 121003,
  "kids": [
    121016,
    121109,
    121168
  ],
  "score": 25,
  "text": "<i>or</i> HN: the Next Iteration<p>I get the impression that with Arc being released a lot of people who never had time for HN before are suddenly dropping in more often. (PG: what are the numbers on this? I'm envisioning a spike.)<p>Not to say that isn't great, but I'm wary of Diggification. Between links comparing programming to sex and a flurry of gratuitous, ostentatious  adjectives in the headlines it's a bit concerning.<p>80% of the stuff that makes the front page is still pretty awesome, but what's in place to keep the signal/noise ratio high? Does the HN model still work as the community scales? What's in store for (++ HN)?",
  "time": 1203647620,
  "title": "Ask HN: The Arc Effect",
  "type": "story"
}
```

### Job response

```json
{
  "by": "justin",
  "id": 192327,
  "score": 6,
  "text": "Justin.tv is the biggest live video site online. We serve hundreds of thousands of video streams a day, and have supported up to 50k live concurrent viewers. Our site is growing every week, and we just added a 10 gbps line to our colo. Our unique visitors are up 900% since January.<p>There are a lot of pieces that fit together to make Justin.tv work: our video cluster, IRC server, our web app, and our monitoring and search services, to name a few. A lot of our website is dependent on Flash, and we're looking for talented Flash Engineers who know AS2 and AS3 very well who want to be leaders in the development of our Flash.<p>Responsibilities<p><pre><code>    * Contribute to product design and implementation discussions\n    * Implement projects from the idea phase to production\n    * Test and iterate code before and after production release \n</code></pre>\nQualifications<p><pre><code>    * You should know AS2, AS3, and maybe a little be of Flex.\n    * Experience building web applications.\n    * A strong desire to work on website with passionate users and ideas for how to improve it.\n    * Experience hacking video streams, python, Twisted or rails all a plus.\n</code></pre>\nWhile we're growing rapidly, Justin.tv is still a small, technology focused company, built by hackers for hackers. Seven of our ten person team are engineers or designers. We believe in rapid development, and push out new code releases every week. We're based in a beautiful office in the SOMA district of SF, one block from the caltrain station. If you want a fun job hacking on code that will touch a lot of people, JTV is for you.<p>Note: You must be physically present in SF to work for JTV. Completing the technical problem at <a href=\"http://www.justin.tv/problems/bml\" rel=\"nofollow\">http://www.justin.tv/problems/bml</a> will go a long way with us. Cheers!",
  "time": 1210981217,
  "title": "Justin.tv is looking for a Lead Flash Engineer!",
  "type": "job",
  "url": ""
}
```

### Poll response

```json

{
  "by": "pg",
  "descendants": 54,
  "id": 126809,
  "kids": [
    126822,
    "..."
  ],
  "parts": [
    126810,
    126811,
    126812
  ],
  "score": 46,
  "text": "",
  "time": 1204403652,
  "title": "Poll: What would happen if News.YC had explicit support for polls?",
  "type": "poll"
}
```

And one of its parts response

```json
{
  "by": "pg",
  "id": 160705,
  "poll": 160704,
  "score": 335,
  "text": "Yes, ban them; I'm tired of seeing Valleywag stories on News.YC.",
  "time": 1207886576,
  "type": "pollopt"
}
```

## Users

API: ` https://hacker-news.firebaseio.com/v0/user/{username}.json`

### Response

```json
{
  "about": "This is a test",
  "created": 1173923446,
  "delay": 0,
  "id": "jl",
  "karma": 2937,
  "submitted": [
    8265435,
    8168423,
    "..."
  ]
}
```

## Live Data

### Max Item ID

API: `https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty`

### New Top and best stories

Up to 500 toop and new stories at `/v0/topstories` also contains jobs and `/v0/newstories`.

Best stories are at `/v0/beststories`

API: `https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`

### Ask Show and Job Stories

Upto 200 of the latest Ask HN, Show HN, and Job Stories `/v0/askstories`, `/v0/showstories`,
and `/v0/jobstories`.

API: `https://hacker-news.firebaseio.com/v0/askstories.json?print=pretty`

