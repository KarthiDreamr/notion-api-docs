---
title: Comments API
sidebar_position: 8
slug: /guides/comments
---

# Comments API

Comments enable discussion and collaboration on Notion pages and blocks. Use the Comments API to retrieve, create, update, and manage comments programmatically for collaborative workflows.

## Available endpoints

- **Retrieve comments** - `GET /v1/comments`
- **Create a comment** - `POST /v1/comments`
- **Update a comment** - `PATCH /v1/comments/:id`
- **Delete a comment** - `DELETE /v1/comments/:id`

## Required headers

All Comments API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")
- `Content-Type: application/json` (for POST/PATCH requests)

## Retrieve comments

Get comments from a specific discussion thread.

**Endpoint:** `GET /v1/comments`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/comments?discussion_id=${DISCUSSION_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getComments(discussionId, startCursor = null) {
  const params = new URLSearchParams();
  if (discussionId) params.append('discussion_id', discussionId);
  if (startCursor) params.append('start_cursor', startCursor);

  const response = await fetch(`https://api.notion.com/v1/comments?${params}`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Get all comments in a discussion
async function getAllComments(discussionId) {
  let allComments = [];
  let cursor = null;
  
  do {
    const response = await getComments(discussionId, cursor);
    allComments = allComments.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allComments;
}
```

**Python (Flask):**
```python
import requests
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/comments', methods=['GET'])
def get_comments():
    discussion_id = request.args.get('discussion_id')
    start_cursor = request.args.get('start_cursor')
    
    params = {}
    if discussion_id:
        params['discussion_id'] = discussion_id
    if start_cursor:
        params['start_cursor'] = start_cursor
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get('https://api.notion.com/v1/comments', headers=headers, params=params)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def get_all_comments(discussion_id):
    all_comments = []
    cursor = None
    
    while True:
        params = {'discussion_id': discussion_id}
        if cursor:
            params['start_cursor'] = cursor
        
        headers = {
            'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
            'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
        }
        
        response = requests.get('https://api.notion.com/v1/comments', headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        all_comments.extend(data['results'])
        
        if not data.get('has_more'):
            break
        cursor = data['next_cursor']
    
    return all_comments
```

### Response example
```json
{
  "object": "list",
  "results": [
    {
      "object": "comment",
      "id": "13135b8e-e4c3-4c3a-b82e-e71f6f0a6b2d",
      "parent": {
        "type": "page_id",
        "page_id": "b55c9c91-384d-452b-81db-d1ef79372b75"
      },
      "discussion_id": "13135b8e-e4c3-4c3a-b82e-e71f6f0a6b2d",
      "created_time": "2022-03-01T19:05:00.000Z",
      "last_edited_time": "2022-03-01T19:05:00.000Z",
      "created_by": {
        "object": "user",
        "id": "6794760a-1f15-45cd-9c65-0dfe42f5135a"
      },
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "This looks great! One suggestion..."
          }
        }
      ]
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

## Create a comment

Add a new comment to a page or discussion thread.

**Endpoint:** `POST /v1/comments`

### Comment on a page

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "type": "page_id",
      "page_id": "'"${PAGE_ID}"'"
    },
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a great page! I have some feedback on the content structure."
        }
      }
    ]
  }'
```

### Reply to a discussion

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "discussion_id": "'"${DISCUSSION_ID}"'",
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Thanks for the suggestion! I will implement this change."
        }
      }
    ]
  }'
```

### Example requests

**JavaScript (Vite):**
```js
async function createComment(commentData) {
  const response = await fetch('https://api.notion.com/v1/comments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commentData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Comment on a page
async function commentOnPage(pageId, text) {
  return await createComment({
    parent: {
      type: "page_id",
      page_id: pageId
    },
    rich_text: [
      {
        type: "text",
        text: {
          content: text
        }
      }
    ]
  });
}

// Reply to a discussion
async function replyToDiscussion(discussionId, text) {
  return await createComment({
    discussion_id: discussionId,
    rich_text: [
      {
        type: "text",
        text: {
          content: text
        }
      }
    ]
  });
}
```

**Python (Flask):**
```python
@app.route('/comments', methods=['POST'])
def create_comment():
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/comments', headers=headers, json=data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def comment_on_page(page_id, text):
    comment_data = {
        "parent": {
            "type": "page_id",
            "page_id": page_id
        },
        "rich_text": [
            {
                "type": "text",
                "text": {
                    "content": text
                }
            }
        ]
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/comments', headers=headers, json=comment_data)
    response.raise_for_status()
    return response.json()

def reply_to_discussion(discussion_id, text):
    comment_data = {
        "discussion_id": discussion_id,
        "rich_text": [
            {
                "type": "text",
                "text": {
                    "content": text
                }
            }
        ]
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/comments', headers=headers, json=comment_data)
    response.raise_for_status()
    return response.json()
```

## Update a comment

Modify an existing comment's content or status.

**Endpoint:** `PATCH /v1/comments/:id`

### Example requests

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/comments/${COMMENT_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Updated comment content with additional details."
        }
      }
    ]
  }'
```

**JavaScript (Vite):**
```js
async function updateComment(commentId, updates) {
  const response = await fetch(`https://api.notion.com/v1/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Update comment text
async function updateCommentText(commentId, newText) {
  return await updateComment(commentId, {
    rich_text: [
      {
        type: "text",
        text: {
          content: newText
        }
      }
    ]
  });
}
```

**Python (Flask):**
```python
@app.route('/comments/<comment_id>', methods=['PATCH'])
def update_comment(comment_id):
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/comments/{comment_id}', headers=headers, json=data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def update_comment_text(comment_id, new_text):
    update_data = {
        "rich_text": [
            {
                "type": "text",
                "text": {
                    "content": new_text
                }
            }
        ]
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/comments/{comment_id}', headers=headers, json=update_data)
    response.raise_for_status()
    return response.json()
```

## Delete a comment

Remove a comment from a discussion.

**Endpoint:** `DELETE /v1/comments/:id`

### Example requests

**curl:**
```bash
curl -X DELETE "https://api.notion.com/v1/comments/${COMMENT_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function deleteComment(commentId) {
  const response = await fetch(`https://api.notion.com/v1/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return true; // Successful deletion
}
```

**Python (Flask):**
```python
@app.route('/comments/<comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.delete(f'https://api.notion.com/v1/comments/{comment_id}', headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return '', 204  # No content response for successful deletion

def delete_comment_by_id(comment_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.delete(f'https://api.notion.com/v1/comments/{comment_id}', headers=headers)
    response.raise_for_status()
    return True
```

## Rich text formatting

Comments support rich text formatting:

```json
{
  "rich_text": [
    {
      "type": "text",
      "text": {
        "content": "This is bold text with a link",
        "link": {
          "url": "https://example.com"
        }
      },
      "annotations": {
        "bold": true,
        "italic": false,
        "strikethrough": false,
        "underline": false,
        "code": false,
        "color": "default"
      }
    },
    {
      "type": "text",
      "text": {
        "content": " and this is italic."
      },
      "annotations": {
        "italic": true
      }
    }
  ]
}
```

## Comment parent types

Comments can be attached to different parent types:

### Page comment
```json
{
  "parent": {
    "type": "page_id",
    "page_id": "b55c9c91-384d-452b-81db-d1ef79372b75"
  }
}
```

### Block comment
```json
{
  "parent": {
    "type": "block_id",
    "block_id": "13135b8e-e4c3-4c3a-b82e-e71f6f0a6b2d"
  }
}
```

### Discussion reply
```json
{
  "discussion_id": "13135b8e-e4c3-4c3a-b82e-e71f6f0a6b2d"
}
```

## Pagination

Comments are paginated when there are many in a discussion:

```js
async function getAllCommentsInDiscussion(discussionId) {
  let allComments = [];
  let cursor = null;
  
  do {
    const response = await getComments(discussionId, cursor);
    allComments = allComments.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allComments;
}
```

## Error handling

Common error responses:

- **400 Bad Request**: Invalid comment structure or missing required fields
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Integration doesn't have permission to comment on the resource
- **404 Not Found**: Comment, page, or discussion doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

## Best practices

1. **Validate content**: Check comment text length and formatting before sending
2. **Handle threading**: Track discussion IDs to maintain proper comment threads
3. **Implement pagination**: Always handle `has_more` and `next_cursor` for complete comment lists
4. **Manage permissions**: Ensure users have appropriate permissions to comment
5. **Rate limiting**: Implement exponential backoff for 429 responses
6. **Real-time updates**: Consider webhooks for live comment notifications

## Limitations

- Maximum 2000 characters per comment
- Comments cannot be edited after a certain time period
- Rich text formatting has some restrictions
- Bulk operations are not supported (must create/update comments individually)

## Use cases

### Feedback collection
```js
// Add feedback comment to a page
await commentOnPage(pageId, "Great work! Consider adding more examples in section 2.");
```

### Threaded discussions
```js
// Start a discussion and reply to it
const initialComment = await commentOnPage(pageId, "What do you think about this approach?");
const discussionId = initialComment.discussion_id;

await replyToDiscussion(discussionId, "I think it's solid, but we should consider edge cases.");
await replyToDiscussion(discussionId, "Agreed! Let me add those test scenarios.");
```

### Comment moderation
```js
// Get all comments on a page and filter for inappropriate content
const comments = await getAllComments(discussionId);
const flaggedComments = comments.filter(comment => 
  comment.rich_text.some(text => 
    text.text.content.includes('inappropriate-keyword')
  )
);

// Delete flagged comments
for (const comment of flaggedComments) {
  await deleteComment(comment.id);
}
```

## Next steps

- Set up [Webhooks](webhooks) to receive real-time comment notifications
- Review [Auth basics](/auth) for managing comment permissions  
- Learn about [Error handling](errors) patterns for robust comment systems
- Explore [Search API](/guides/search) to find comments across your workspace

