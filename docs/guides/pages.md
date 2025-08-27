---
title: Pages API
sidebar_position: 5
slug: /guides/pages
---

# Pages API

Pages are the fundamental content units in Notion. They can exist as standalone pages or as records within databases. Use the Pages API to create, retrieve, update, and manage page content and properties.

## Available endpoints

- **Create a page** - `POST /v1/pages`
- **Create a page with content** - `POST /v1/pages` (with children blocks)
- **Retrieve a page** - `GET /v1/pages/:id`
- **Update page properties** - `PATCH /v1/pages/:id`
- **Archive a page** - `PATCH /v1/pages/:id` (with archived: true)

## Required headers

All Pages API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")
- `Content-Type: application/json` (for POST/PATCH requests)

## Create a page

Create a new page in a database or as a child of another page.

**Endpoint:** `POST /v1/pages`

### Create a database page

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "type": "database_id",
      "database_id": "'"${DATABASE_ID}"'"
    },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": "New Task"
            }
          }
        ]
      },
      "Status": {
        "select": {
          "name": "To Do"
        }
      }
    }
  }'
```

**JavaScript (Vite):**
```js
async function createPage(databaseId, properties) {
  const pageData = {
    parent: {
      type: "database_id",
      database_id: databaseId
    },
    properties: properties
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Example usage
const properties = {
  "Name": {
    "title": [
      {
        "text": {
          "content": "New Task"
        }
      }
    ]
  },
  "Status": {
    "select": {
      "name": "To Do"
    }
  }
};

const newPage = await createPage(databaseId, properties);
```

**Python (Flask):**
```python
import requests
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/pages', methods=['POST'])
def create_page():
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/pages', headers=headers, json=data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def create_database_page(database_id, properties):
    page_data = {
        "parent": {
            "type": "database_id",
            "database_id": database_id
        },
        "properties": properties
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/pages', headers=headers, json=page_data)
    response.raise_for_status()
    return response.json()
```

## Create a page with content

Create a page and add block content in a single request.

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "type": "database_id",
      "database_id": "'"${DATABASE_ID}"'"
    },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": "Recipe: Kale Salad"
            }
          }
        ]
      }
    },
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Ingredients"
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
                "content": "Fresh kale, olive oil, lemon juice, parmesan cheese"
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
async function createPageWithContent(databaseId, title, blocks) {
  const pageData = {
    parent: {
      type: "database_id",
      database_id: databaseId
    },
    properties: {
      "Name": {
        "title": [
          {
            "text": {
              "content": title
            }
          }
        ]
      }
    },
    children: blocks
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Example usage
const blocks = [
  {
    "object": "block",
    "type": "heading_2",
    "heading_2": {
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Ingredients"
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
            "content": "Fresh kale, olive oil, lemon juice, parmesan cheese"
          }
        }
      ]
    }
  }
];

const pageWithContent = await createPageWithContent(databaseId, "Recipe: Kale Salad", blocks);
```

**Python (Flask):**
```python
def create_page_with_content(database_id, title, blocks):
    page_data = {
        "parent": {
            "type": "database_id",
            "database_id": database_id
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        },
        "children": blocks
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/pages', headers=headers, json=page_data)
    response.raise_for_status()
    return response.json()
```

## Retrieve a page

Get page properties and metadata.

**Endpoint:** `GET /v1/pages/:id`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getPage(pageId) {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
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
@app.route('/pages/<page_id>', methods=['GET'])
def get_page(page_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(f'https://api.notion.com/v1/pages/{page_id}', headers=headers)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def get_page_by_id(page_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(f'https://api.notion.com/v1/pages/{page_id}', headers=headers)
    response.raise_for_status()
    return response.json()
```

### Response example
```json
{
  "object": "page",
  "id": "b55c9c91-384d-452b-81db-d1ef79372b75",
  "created_time": "2022-03-01T19:05:00.000Z",
  "last_edited_time": "2022-03-01T19:05:00.000Z",
  "created_by": {
    "object": "user",
    "id": "6794760a-1f15-45cd-9c65-0dfe42f5135a"
  },
  "last_edited_by": {
    "object": "user",
    "id": "6794760a-1f15-45cd-9c65-0dfe42f5135a"
  },
  "cover": null,
  "icon": null,
  "parent": {
    "type": "database_id",
    "database_id": "8e2c2b76-9e1d-47d2-87b9-ed3035d607ae"
  },
  "archived": false,
  "properties": {
    "Name": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "New Task"
          }
        }
      ]
    },
    "Status": {
      "id": "status",
      "type": "select",
      "select": {
        "name": "To Do"
      }
    }
  }
}
```

## Update page properties

Update specific properties of a page without affecting others.

**Endpoint:** `PATCH /v1/pages/:id`

### Example requests

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "select": {
          "name": "In Progress"
        }
      }
    }
  }'
```

**JavaScript (Vite):**
```js
async function updatePageProperties(pageId, properties) {
  const updateData = {
    properties: properties
  };

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Example usage
const updatedProperties = {
  "Status": {
    "select": {
      "name": "In Progress"
    }
  }
};

const updatedPage = await updatePageProperties(pageId, updatedProperties);
```

**Python (Flask):**
```python
@app.route('/pages/<page_id>', methods=['PATCH'])
def update_page_properties(page_id):
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/pages/{page_id}', headers=headers, json=data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def update_page_properties_by_id(page_id, properties):
    update_data = {
        "properties": properties
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/pages/{page_id}', headers=headers, json=update_data)
    response.raise_for_status()
    return response.json()
```

## Archive a page

Archive a page by setting the `archived` property to `true`.

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "archived": true
  }'
```

**JavaScript (Vite):**
```js
async function archivePage(pageId) {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ archived: true })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}
```

**Python (Flask):**
```python
@app.route('/pages/<page_id>/archive', methods=['PATCH'])
def archive_page(page_id):
    archive_data = {"archived": True}
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/pages/{page_id}', headers=headers, json=archive_data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def archive_page_by_id(page_id):
    archive_data = {"archived": True}
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/pages/{page_id}', headers=headers, json=archive_data)
    response.raise_for_status()
    return response.json()
```

## Property types

Common property types when creating/updating pages:

### Title property
```json
{
  "Name": {
    "title": [
      {
        "text": {
          "content": "Page Title"
        }
      }
    ]
  }
}
```

### Select property
```json
{
  "Status": {
    "select": {
      "name": "In Progress"
    }
  }
}
```

### Multi-select property
```json
{
  "Tags": {
    "multi_select": [
      {"name": "urgent"},
      {"name": "work"}
    ]
  }
}
```

### Date property
```json
{
  "Due Date": {
    "date": {
      "start": "2022-12-08"
    }
  }
}
```

### Rich text property
```json
{
  "Description": {
    "rich_text": [
      {
        "text": {
          "content": "Detailed description here"
        }
      }
    ]
  }
}
```

### Number property
```json
{
  "Priority": {
    "number": 5
  }
}
```

### Checkbox property
```json
{
  "Completed": {
    "checkbox": false
  }
}
```

## Error handling

Common error responses:

- **400 Bad Request**: Invalid property values or page structure
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Integration doesn't have access to create/edit pages
- **404 Not Found**: Page or parent doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

Always validate property types against the database schema before making requests.

## Best practices

1. **Validate properties**: Check database schema before creating pages
2. **Use proper property types**: Match the exact format expected by each property type
3. **Handle large content**: Use the Blocks API for complex page content
4. **Implement retries**: Handle 429 rate limits with exponential backoff
5. **Batch operations**: Group multiple page updates when possible

## Next steps

- Learn about [Blocks API](/docs/guides/blocks) to manage page content structure
- Set up [Webhooks](/docs/webhooks) to receive real-time page updates
- Review [Error handling](/docs/errors) patterns for robust page operations
