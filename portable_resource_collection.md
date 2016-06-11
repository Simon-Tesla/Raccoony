Portable Resource Collection
============================

Manifest file
-------------

The manifest file is a JSON (or XML?) document with the following structure:

```javascript
{
    "resources": [
        "resourceUri": "http://example.com/resource.jpg",
        "resourceType": "image/jpeg",
        "authors": [
            {
                "name": "John Doe", 
                "email": "johndoe@example.com",
                "uri": "http://johndoe.example.com" //Make an array?
            },
            ...
        ]
        "sourceUri": "http://example.com/source.html",
        "title": "Example title",
        "description": "Example *description* with formatting.",
        "descriptionType": "text/markdown",
        "tags": ["example", "tags"],
        "date": "2016/3/15 15:03:00+08", //Check if standard format
        "groupings": [ // TODO: should groupings be defined separately?
            { "name": "Folder A" },
            {
                "name": "Multi-page strictly-ordered artifact",
                "index": 3
            },
            ...
        ], 
        "discussion": [
            {
                "author": {
                    "name": "Commentor",
                    "email": "commentor@example.com",
                    "uri": "http://commentor.example.com"
                },
                "comment": "My [b]comment[/b] here",
                "commentType": "text/x-bbcode",
                "date": "DATETIME",
                "sourceUri": "http://example.com/source.html#commentId"
                "inReplyToUri": "http://example.com/source.html#commentIdOrig"
            },
            ...
        ],
        // extension fields, may not be standardized
        "x-contentRating": "Mature"
        "x-favoriteCount": 69,
        "x-viewCount": 532
    ],
    "profile": {
        //Object that describes a user profile
        "name": "John Doe",
        "alias": "Adjective Species"
    },
    "messages": [
        {
            "uri": URI,
            "subject": "blah",
            "recipients": [PERSON, ...],
            "body": "body text",
            "bodyType": "text/plain",
            "date": DATETIME,
            "inReplyToUri": URI,
            "groupings": ["inbox"]
        },
        ...
    ]
}
```