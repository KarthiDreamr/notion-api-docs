---
title: Search API
sidebar_position: 7
slug: /guides/search
---

# Search API

The Search API allows you to query across all pages and databases in your Notion workspace. Use it to find content, build search interfaces, or discover related information programmatically.

## Available endpoint

- **Search workspace** - `POST /v1/search`

## Required headers

All Search API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")
- `Content-Type: application/json`

## Basic search

Search for content containing specific keywords.

**Endpoint:** `POST /v1/search`

### Example requests

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "project management"
  }'
```

**JavaScript (Vite):**
```js
async function searchWorkspace(query, options = {}) {
  const searchBody = {
    query: query,
    ...options
  };

  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_NOTION_TOKEN}`,
      'Notion-Version': import.meta.env.VITE_NOTION_VERSION || '2022-02-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchBody)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// Basic search
const results = await searchWorkspace("project management");
console.log('Search results:', results);
```

**Python (Flask):**
```python
import requests
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/search', methods=['POST'])
def search_workspace():
    data = request.json
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/search', headers=headers, json=data)
    
    if response.status_code != 200:
        return jsonify({'error': response.text}), response.status_code
    
    return jsonify(response.json())

def search_for_content(query, **options):
    search_body = {
        'query': query,
        **options
    }
    
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22'),
        'Content-Type': 'application/json'
    }
    
    response = requests.post('https://api.notion.com/v1/search', headers=headers, json=search_body)
    response.raise_for_status()
    return response.json()
```

### Response example
```json
{
  "object": "list",
  "results": [
    {
      "object": "page",
      "id": "b55c9c91-384d-452b-81db-d1ef79372b75",
      "created_time": "2022-03-01T19:05:00.000Z",
      "last_edited_time": "2022-03-01T19:05:00.000Z",
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
                "content": "Project Management Best Practices"
              }
            }
          ]
        }
      }
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

## Search with filters

Filter search results by object type (page or database).

### Filter by pages only

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "tasks",
    "filter": {
      "property": "object",
      "value": "page"
    }
  }'
```

**JavaScript (Vite):**
```js
// Search for pages only
const pageResults = await searchWorkspace("tasks", {
  filter: {
    property: "object",
    value: "page"
  }
});

// Search for databases only
const databaseResults = await searchWorkspace("tasks", {
  filter: {
    property: "object", 
    value: "database"
  }
});
```

**Python (Flask):**
```python
# Search for pages only
page_results = search_for_content("tasks", filter={
    "property": "object",
    "value": "page"
})

# Search for databases only
database_results = search_for_content("tasks", filter={
    "property": "object",
    "value": "database"
})
```

## Search with sorting

Sort results by creation time or last edited time.

### Sort by last edited time

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "meeting notes",
    "sort": {
      "direction": "descending",
      "timestamp": "last_edited_time"
    }
  }'
```

**JavaScript (Vite):**
```js
// Sort by most recently edited
const recentResults = await searchWorkspace("meeting notes", {
  sort: {
    direction: "descending",
    timestamp: "last_edited_time"
  }
});

// Sort by creation time, oldest first
const oldestResults = await searchWorkspace("archive", {
  sort: {
    direction: "ascending",
    timestamp: "created_time"
  }
});
```

**Python (Flask):**
```python
# Sort by most recently edited
recent_results = search_for_content("meeting notes", sort={
    "direction": "descending",
    "timestamp": "last_edited_time"
})

# Sort by creation time, oldest first
oldest_results = search_for_content("archive", sort={
    "direction": "ascending", 
    "timestamp": "created_time"
})
```

## Advanced search with multiple options

Combine query, filters, and sorting for precise results.

**curl:**
```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "sprint",
    "filter": {
      "property": "object",
      "value": "page"
    },
    "sort": {
      "direction": "descending",
      "timestamp": "last_edited_time"
    },
    "page_size": 50
  }'
```

**JavaScript (Vite):**
```js
async function advancedSearch(query, filterValue, sortDirection = "descending") {
  return await searchWorkspace(query, {
    filter: {
      property: "object",
      value: filterValue
    },
    sort: {
      direction: sortDirection,
      timestamp: "last_edited_time"
    },
    page_size: 50
  });
}

// Find recent pages about sprints
const sprintPages = await advancedSearch("sprint", "page", "descending");

// Find all databases, oldest first
const oldDatabases = await advancedSearch("", "database", "ascending");
```

**Python (Flask):**
```python
def advanced_search(query, filter_value=None, sort_direction="descending", page_size=50):
    options = {
        "page_size": page_size,
        "sort": {
            "direction": sort_direction,
            "timestamp": "last_edited_time"
        }
    }
    
    if filter_value:
        options["filter"] = {
            "property": "object",
            "value": filter_value
        }
    
    return search_for_content(query, **options)

# Find recent pages about sprints
sprint_pages = advanced_search("sprint", "page", "descending")

# Find all databases, oldest first
old_databases = advanced_search("", "database", "ascending")
```

## Pagination

Handle large result sets by iterating through pages.

**JavaScript (Vite):**
```js
async function getAllSearchResults(query, options = {}) {
  let allResults = [];
  let cursor = null;
  
  do {
    const searchOptions = { ...options };
    if (cursor) {
      searchOptions.start_cursor = cursor;
    }
    
    const response = await searchWorkspace(query, searchOptions);
    allResults = allResults.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);
  
  return allResults;
}

// Get all pages containing "project"
const allProjectPages = await getAllSearchResults("project", {
  filter: { property: "object", value: "page" }
});
```

**Python (Flask):**
```python
def get_all_search_results(query, **options):
    all_results = []
    cursor = None
    
    while True:
        search_options = {**options}
        if cursor:
            search_options['start_cursor'] = cursor
        
        response = search_for_content(query, **search_options)
        all_results.extend(response['results'])
        
        if not response.get('has_more'):
            break
        cursor = response['next_cursor']
    
    return all_results

# Get all pages containing "project"
all_project_pages = get_all_search_results("project", filter={
    "property": "object", 
    "value": "page"
})
```

## Search parameters

### Query parameter
- **Type**: String
- **Description**: Text to search for in page titles and content
- **Example**: `"project management"`

### Filter parameter
```json
{
  "property": "object",
  "value": "page" | "database"
}
```

### Sort parameter
```json
{
  "direction": "ascending" | "descending",
  "timestamp": "created_time" | "last_edited_time"
}
```

### Page size parameter
- **Type**: Number
- **Description**: Number of results to return (max 100)
- **Default**: 100

## Empty query search

Search without a query to get all accessible content:

**JavaScript (Vite):**
```js
// Get all pages, most recently edited first
const allPages = await searchWorkspace("", {
  filter: { property: "object", value: "page" },
  sort: { direction: "descending", timestamp: "last_edited_time" }
});

// Get all databases
const allDatabases = await searchWorkspace("", {
  filter: { property: "object", value: "database" }
});
```

**Python (Flask):**
```python
# Get all pages, most recently edited first
all_pages = search_for_content("", filter={
    "property": "object", 
    "value": "page"
}, sort={
    "direction": "descending", 
    "timestamp": "last_edited_time"
})

# Get all databases
all_databases = search_for_content("", filter={
    "property": "object", 
    "value": "database"
})
```

## Error handling

Common error responses:

- **400 Bad Request**: Invalid search parameters or malformed request body
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Integration doesn't have search permissions
- **429 Too Many Requests**: Rate limit exceeded

**JavaScript (Vite):**
```js
async function safeSearch(query, options = {}) {
  try {
    return await searchWorkspace(query, options);
  } catch (error) {
    if (error.message.includes('429')) {
      // Wait and retry for rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await searchWorkspace(query, options);
    }
    throw error;
  }
}
```

**Python (Flask):**
```python
import time

def safe_search(query, max_retries=3, **options):
    for attempt in range(max_retries):
        try:
            return search_for_content(query, **options)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                # Rate limited, wait and retry
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            raise
    
    raise Exception(f"Failed after {max_retries} attempts")
```

## Search best practices

1. **Use specific queries**: More specific search terms return more relevant results
2. **Implement pagination**: Always handle `has_more` and `next_cursor` for complete results
3. **Cache results**: Search results don't change frequently, consider caching
4. **Handle rate limits**: Implement exponential backoff for 429 responses
5. **Filter by type**: Use object filters to get only pages or databases when appropriate
6. **Sort appropriately**: Use relevant sorting to prioritize fresh or older content

## Limitations

- Search is limited to content your integration has access to
- Maximum 100 results per page
- Search queries are case-insensitive
- Search includes page titles and text content, but not all property types
- Real-time search - results may include recently created/edited content with some delay

## Use cases

### Content discovery
```js
// Find all pages related to a specific project
const projectContent = await searchWorkspace("Project Alpha", {
  filter: { property: "object", value: "page" },
  sort: { direction: "descending", timestamp: "last_edited_time" }
});
```

### Recent activity monitoring
```js
// Get recently edited content
const recentActivity = await searchWorkspace("", {
  sort: { direction: "descending", timestamp: "last_edited_time" },
  page_size: 20
});
```

### Database discovery
```js
// Find all databases in the workspace
const allDatabases = await searchWorkspace("", {
  filter: { property: "object", value: "database" }
});
```

## Next steps

- Learn about [Comments API](/docs/guides/comments) to add user feedback to search results
- Set up [Webhooks](/docs/webhooks) to trigger search indexing on content changes
- Review [Error handling](/docs/errors) patterns for robust search implementations
- Explore [Auth basics](/docs/auth) for managing search permissions
