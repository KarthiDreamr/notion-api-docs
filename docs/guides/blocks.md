---
title: Blocks API
sidebar_position: 6
slug: /guides/blocks
---

# Blocks API

Blocks are the fundamental content units within Notion pages. They represent different types of content like paragraphs, headings, lists, images, databases, and more. Use the Blocks API to build, modify, and manage page content programmatically.

## Available endpoints

- **Retrieve block children** - `GET /v1/blocks/:id/children`
- **Append block children** - `PATCH /v1/blocks/:id/children`
- **Update a block** - `PATCH /v1/blocks/:id`
- **Retrieve a block** - `GET /v1/blocks/:id`
- **Delete a block** - `DELETE /v1/blocks/:id`

## Required headers

All Blocks API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")
- `Content-Type: application/json` (for POST/PATCH requests)

## Retrieve block children

Get all child blocks of a page or block. This is useful for reading page content or navigating nested block structures.

**Endpoint:** `GET /v1/blocks/:id/children`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/blocks/${BLOCK_ID}/children?page_size=100" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getBlockChildren(blockId, startCursor = null) {
  const params = new URLSearchParams({ page_size: '100' });
  if (startCursor) {
    params.append('start_cursor', startCursor);
  }

  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?${params}`, {
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

// Get all children (handle pagination)
async function getAllBlockChildren(blockId) {
  let allBlocks = [];
  let cursor = null;
  
  do {
    const response = await getBlockChildren(blockId, cursor);
    allBlocks = allBlocks.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allBlocks;
}
```

**Python (Flask):**
```python
import requests
import os
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/blocks/<block_id>/children', methods=['GET'])
def get_block_children(block_id):
    page_size = request.args.get('page_size', '100')
    start_cursor = request.args.get('start_cursor')
    
    params = {'page_size': page_size}
    if start_cursor:
        params['start_cursor'] = start_cursor
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(
        f'https://api.notion.com/v1/blocks/{block_id}/children',
        headers=headers,
        params=params
    )
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def get_all_block_children(block_id):
    all_blocks = []
    cursor = None
    
    while True:
        params = {'page_size': '100'}
        if cursor:
            params['start_cursor'] = cursor
        
        headers = {
            'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
            'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
        }
        
        response = requests.get(
            f'https://api.notion.com/v1/blocks/{block_id}/children',
            headers=headers,
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        all_blocks.extend(data['results'])
        
        if not data.get('has_more'):
            break
        cursor = data['next_cursor']
    
    return all_blocks
```

## Append block children

Add new blocks as children to a page or existing block. This is how you programmatically add content to pages.

**Endpoint:** `PATCH /v1/blocks/:id/children`

### Example requests

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/blocks/${BLOCK_ID}/children" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "New Section"
              }
            }
          ]
        }
      },
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "This is a new paragraph with "
              }
            },
            {
              "type": "text",
              "text": {
                "content": "bold text",
                "link": null
              },
              "annotations": {
                "bold": true
              }
            }
          ]
        }
      }
    ]
  }'
```

**JavaScript (Vite):**
```js
async function appendBlockChildren(blockId, children) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ children })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Helper function to create common block types
function createTextBlock(text, type = 'paragraph') {
  return {
    object: 'block',
    type: type,
    [type]: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: text
          }
        }
      ]
    }
  };
}

function createHeadingBlock(text, level = 2) {
  const headingType = `heading_${level}`;
  return {
    object: 'block',
    type: headingType,
    [headingType]: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: text
          }
        }
      ]
    }
  };
}

// Example usage
const newBlocks = [
  createHeadingBlock('Getting Started', 2),
  createTextBlock('Welcome to our API documentation.'),
  createTextBlock('Follow these steps to integrate with our service.')
];

await appendBlockChildren(pageId, newBlocks);
```

**Python (Flask):**
```python
@app.route('/blocks/<block_id>/children', methods=['PATCH'])
def append_block_children(block_id):
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(
        f'https://api.notion.com/v1/blocks/{block_id}/children',
        headers=headers,
        json=data
    )
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def create_text_block(text, block_type='paragraph'):
    return {
        'object': 'block',
        'type': block_type,
        block_type: {
            'rich_text': [
                {
                    'type': 'text',
                    'text': {
                        'content': text
                    }
                }
            ]
        }
    }

def create_heading_block(text, level=2):
    heading_type = f'heading_{level}'
    return {
        'object': 'block',
        'type': heading_type,
        heading_type: {
            'rich_text': [
                {
                    'type': 'text',
                    'text': {
                        'content': text
                    }
                }
            ]
        }
    }

def append_blocks_to_page(block_id, children):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(
        f'https://api.notion.com/v1/blocks/{block_id}/children',
        headers=headers,
        json={'children': children}
    )
    response.raise_for_status()
    return response.json()
```

## Update a block

Modify the content of an existing block.

**Endpoint:** `PATCH /v1/blocks/:id`

### Example requests

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/blocks/${BLOCK_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "paragraph": {
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Updated paragraph content"
          }
        }
      ]
    }
  }'
```

**JavaScript (Vite):**
```js
async function updateBlock(blockId, blockContent) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(blockContent)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Update a paragraph block
await updateBlock(blockId, {
  paragraph: {
    rich_text: [
      {
        type: 'text',
        text: {
          content: 'Updated paragraph content'
        }
      }
    ]
  }
});

// Update a heading block
await updateBlock(blockId, {
  heading_2: {
    rich_text: [
      {
        type: 'text',
        text: {
          content: 'Updated Heading'
        }
      }
    ]
  }
});
```

**Python (Flask):**
```python
@app.route('/blocks/<block_id>', methods=['PATCH'])
def update_block(block_id):
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(
        f'https://api.notion.com/v1/blocks/{block_id}',
        headers=headers,
        json=data
    )
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def update_paragraph_block(block_id, text):
    block_content = {
        'paragraph': {
            'rich_text': [
                {
                    'type': 'text',
                    'text': {
                        'content': text
                    }
                }
            ]
        }
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(
        f'https://api.notion.com/v1/blocks/{block_id}',
        headers=headers,
        json=block_content
    )
    response.raise_for_status()
    return response.json()
```

## Retrieve a block

Get information about a specific block.

**Endpoint:** `GET /v1/blocks/:id`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/blocks/${BLOCK_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getBlock(blockId) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
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
```

**Python (Flask):**
```python
@app.route('/blocks/<block_id>', methods=['GET'])
def get_block(block_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(f'https://api.notion.com/v1/blocks/{block_id}', headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())
```

## Delete a block

Remove a block from a page.

**Endpoint:** `DELETE /v1/blocks/:id`

### Example requests

**curl:**
```bash
curl -X DELETE "https://api.notion.com/v1/blocks/${BLOCK_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function deleteBlock(blockId) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
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
@app.route('/blocks/<block_id>', methods=['DELETE'])
def delete_block(block_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.delete(f'https://api.notion.com/v1/blocks/{block_id}', headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return '', 204  # No content response for successful deletion

def delete_block_by_id(block_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.delete(f'https://api.notion.com/v1/blocks/{block_id}', headers=headers)
    response.raise_for_status()
    return True
```

## Common block types

### Paragraph block
```json
{
  "object": "block",
  "type": "paragraph",
  "paragraph": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a paragraph."
        }
      }
    ]
  }
}
```

### Heading blocks
```json
{
  "object": "block",
  "type": "heading_2",
  "heading_2": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a heading"
        }
      }
    ]
  }
}
```

### Bulleted list item
```json
{
  "object": "block",
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a list item"
        }
      }
    ]
  }
}
```

### To-do item
```json
{
  "object": "block",
  "type": "to_do",
  "to_do": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a to-do item"
        }
      }
    ],
    "checked": false
  }
}
```

## Rich text formatting

Add formatting to text within blocks:

```json
{
  "type": "text",
  "text": {
    "content": "Bold and italic text",
    "link": null
  },
  "annotations": {
    "bold": true,
    "italic": true,
    "strikethrough": false,
    "underline": false,
    "code": false,
    "color": "default"
  }
}
```

## Pagination

Block children responses are paginated. Handle large pages by iterating through all pages:

```js
async function getAllBlockChildren(blockId) {
  let allBlocks = [];
  let cursor = null;
  
  do {
    const response = await getBlockChildren(blockId, cursor);
    allBlocks = allBlocks.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allBlocks;
}
```

## Error handling

Common error responses:

- **400 Bad Request**: Invalid block structure or unsupported block type
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Integration doesn't have access to the page/block
- **404 Not Found**: Block doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

## Best practices

1. **Batch operations**: Add multiple blocks in a single append request
2. **Handle pagination**: Always check for `has_more` and `next_cursor` in responses  
3. **Validate block structure**: Ensure blocks follow the correct schema
4. **Cache block data**: Avoid redundant API calls when possible
5. **Implement retries**: Handle rate limits with exponential backoff
6. **Use specific block types**: Choose the most appropriate block type for your content

## Limitations

- Maximum 100 blocks per append operation
- Block children responses are limited to 100 blocks per page
- Some block types (like synced blocks) have restrictions on modification
- Nested blocks have depth limitations

## Next steps

- Learn about [Search API](/guides/search) to find content across your workspace
- Review [Comments API](/guides/comments) for adding user feedback to pages
- Set up [Webhooks](/webhooks) to receive real-time updates when blocks change
- Review [Error handling](/errors) patterns for robust block operations
