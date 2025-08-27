---
title: Databases API
sidebar_position: 4
slug: /guides/databases
---

# Databases API

Databases are the foundation of structured data in Notion. Use these endpoints to retrieve database schemas, query data with filters and sorting, create new databases, and update existing ones.

## Available endpoints

- **Retrieve database** - `GET /v1/databases/:id`
- **Query database** - `POST /v1/databases/:id/query`
- **Create database** - `POST /v1/databases`
- **Update database** - `PATCH /v1/databases/:id`
- **Update database properties** - `PATCH /v1/databases/:id`

## Required headers

All Database API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")
- `Content-Type: application/json` (for POST/PATCH requests)

## Retrieve database

Get the schema and metadata for a database, including all property definitions.

**Endpoint:** `GET /v1/databases/:id`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/databases/${DATABASE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getDatabase(databaseId) {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
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
import requests
import os

def get_database(database_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(f'https://api.notion.com/v1/databases/{database_id}', headers=headers)
    response.raise_for_status()
    return response.json()
```

## Query database

Retrieve pages from a database with optional filtering and sorting. This is the most commonly used database operation.

**Endpoint:** `POST /v1/databases/:id/query`

### Basic query (all pages)

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/databases/${DATABASE_ID}/query" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**JavaScript (Vite):**
```js
async function queryDatabase(databaseId, queryBody = {}) {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(queryBody)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}
```

**Python (Flask):**
```python
def query_database(database_id, query_body=None):
    if query_body is None:
        query_body = {}
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f'https://api.notion.com/v1/databases/{database_id}/query',
        headers=headers,
        json=query_body
    )
    response.raise_for_status()
    return response.json()
```

### Query with filters

Filter pages based on property values.

**Example: Filter by status property**

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/databases/${DATABASE_ID}/query" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Status",
      "select": {
        "equals": "In Progress"
      }
    }
  }'
```

**JavaScript (Vite):**
```js
// Filter pages where Status equals "In Progress"
const filterQuery = {
  filter: {
    property: "Status",
    select: {
      equals: "In Progress"
    }
  }
};

const results = await queryDatabase(databaseId, filterQuery);
```

**Python (Flask):**
```python
# Filter pages where Status equals "In Progress"
filter_query = {
    "filter": {
        "property": "Status",
        "select": {
            "equals": "In Progress"
        }
    }
}

results = query_database(database_id, filter_query)
```

### Query with sorting

Sort results by property values.

**Example: Sort by created time, newest first**

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/databases/${DATABASE_ID}/query" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "sorts": [
      {
        "property": "Created time",
        "direction": "descending"
      }
    ]
  }'
```

**JavaScript (Vite):**
```js
// Sort by created time, newest first
const sortQuery = {
  sorts: [
    {
      property: "Created time",
      direction: "descending"
    }
  ]
};

const results = await queryDatabase(databaseId, sortQuery);
```

**Python (Flask):**
```python
# Sort by created time, newest first
sort_query = {
    "sorts": [
        {
            "property": "Created time",
            "direction": "descending"
        }
    ]
}

results = query_database(database_id, sort_query)
```

## Create database

Create a new database with custom properties.

**Endpoint:** `POST /v1/databases`

### Example requests

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "type": "page_id",
      "page_id": "'"${PAGE_ID}"'"
    },
    "title": [
      {
        "type": "text",
        "text": {
          "content": "My New Database"
        }
      }
    ],
    "properties": {
      "Name": {
        "title": {}
      },
      "Status": {
        "select": {
          "options": [
            {
              "name": "To Do",
              "color": "red"
            },
            {
              "name": "In Progress",
              "color": "yellow"
            },
            {
              "name": "Done",
              "color": "green"
            }
          ]
        }
      }
    }
  }'
```

**JavaScript (Vite):**
```js
async function createDatabase(parentPageId, title, properties) {
  const databaseData = {
    parent: {
      type: "page_id",
      page_id: parentPageId
    },
    title: [
      {
        type: "text",
        text: {
          content: title
        }
      }
    ],
    properties: properties
  };

  const response = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(databaseData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}
```

**Python (Flask):**
```python
def create_database(parent_page_id, title, properties):
    database_data = {
        "parent": {
            "type": "page_id",
            "page_id": parent_page_id
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": title
                }
            }
        ],
        "properties": properties
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/databases', headers=headers, json=database_data)
    response.raise_for_status()
    return response.json()
```

## Update database

Update database title, description, or properties.

**Endpoint:** `PATCH /v1/databases/:id`

### Example: Update database title

**curl:**
```bash
curl -X PATCH "https://api.notion.com/v1/databases/${DATABASE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": [
      {
        "type": "text",
        "text": {
          "content": "Updated Database Title"
        }
      }
    ]
  }'
```

**JavaScript (Vite):**
```js
async function updateDatabase(databaseId, updates) {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
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
```

**Python (Flask):**
```python
def update_database(database_id, updates):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.patch(f'https://api.notion.com/v1/databases/{database_id}', headers=headers, json=updates)
    response.raise_for_status()
    return response.json()
```

## Pagination

Query responses are paginated. Use `start_cursor` for subsequent pages:

```js
let allResults = [];
let cursor = undefined;

do {
  const query = cursor ? { start_cursor: cursor } : {};
  const response = await queryDatabase(databaseId, query);
  
  allResults = allResults.concat(response.results);
  cursor = response.next_cursor;
} while (cursor);
```

## Error handling

Common error responses:

- **400 Bad Request**: Invalid query parameters or malformed request body
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Integration doesn't have access to the database
- **404 Not Found**: Database doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

Always implement retry logic with exponential backoff for 429 and 5xx errors.

## Best practices

1. **Cache database schemas**: Database structure changes infrequently
2. **Use pagination**: Don't try to load all pages at once for large databases
3. **Optimize filters**: Use specific property filters to reduce response size
4. **Handle rate limits**: Implement exponential backoff for 429 responses
5. **Validate property types**: Check database schema before querying specific properties
