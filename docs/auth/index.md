---
title: Auth Basics
sidebar_position: 3
slug: /auth
---

# Auth Basics

Effective and secure authentication is critical when integrating with the Notion API. This guide covers token management, required headers, and reusable authentication patterns.

## Authentication overview

- **Bearer Token Authentication**: Every request must include an `Authorization` header with a valid Bearer token
- **Integration Tokens**: Tokens represent your integration's access privileges within a Notion workspace
- **API Versioning**: All requests require a `Notion-Version` header specifying the API version to use

## Required headers

Every Notion API request must include these headers:

| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <your_token>` | Your integration's access token |
| `Notion-Version` | `2022-02-22` | API version (use latest supported date) |
| `Content-Type` | `application/json` | Required for POST/PATCH requests |

## Getting your integration token

If you haven't already set up an integration, follow the [Quickstart Guide](../quickstart/) for complete setup instructions. Never hardcode tokens in your source code.

## Reusable auth helpers

### JavaScript (Vite) helper

Create a reusable fetch wrapper for consistent authentication:

```js
// utils/notion-api.js
export class NotionAPIError extends Error {
  constructor(status, message, response) {
    super(message);
    this.status = status;
    this.response = response;
    this.name = 'NotionAPIError';
  }
}

export async function notionFetch(endpoint, options = {}) {
  const token = import.meta.env.VITE_NOTION_TOKEN;
  const version = import.meta.env.VITE_NOTION_VERSION || '2022-02-22';
  
  if (!token) {
    throw new Error('NOTION_TOKEN is required. Set VITE_NOTION_TOKEN in your environment.');
  }

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://api.notion.com/v1${endpoint}`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': version,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new NotionAPIError(
        response.status, 
        `Notion API Error: ${response.status} ${errorText}`,
        response
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof NotionAPIError) {
      throw error;
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Usage examples
export const notion = {
  async getUsers() {
    return notionFetch('/users');
  },

  async getDatabase(databaseId) {
    return notionFetch(`/databases/${databaseId}`);
  },

  async queryDatabase(databaseId, query = {}) {
    return notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(query)
    });
  },

  async createPage(pageData) {
    return notionFetch('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
  }
};
```

### Python (Flask) helper

Create a requests session with automatic auth:

```python
# utils/notion_client.py
import os
import requests
import time
from typing import Optional, Dict, Any

class NotionAPIError(Exception):
    def __init__(self, status_code: int, message: str, response=None):
        self.status_code = status_code
        self.response = response
        super().__init__(message)

class NotionClient:
    def __init__(self, token: Optional[str] = None, version: Optional[str] = None):
        self.token = token or os.getenv('NOTION_TOKEN')
        self.version = version or os.getenv('NOTION_VERSION', '2022-02-22')
        self.base_url = 'https://api.notion.com/v1'
        
        if not self.token:
            raise ValueError('NOTION_TOKEN is required')
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.token}',
            'Notion-Version': self.version,
            'Content-Type': 'application/json'
        })

    def request(self, method: str, endpoint: str, **kwargs) -> Dict[Any, Any]:
        url = f"{self.base_url}{endpoint}" if not endpoint.startswith('http') else endpoint
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            raise NotionAPIError(
                e.response.status_code,
                f"Notion API Error: {e.response.status_code} {e.response.text}",
                e.response
            )
        except requests.exceptions.RequestException as e:
            raise NotionAPIError(0, f"Request failed: {str(e)}")

    def get(self, endpoint: str, **kwargs) -> Dict[Any, Any]:
        return self.request('GET', endpoint, **kwargs)

    def post(self, endpoint: str, data: Dict[Any, Any] = None, **kwargs) -> Dict[Any, Any]:
        if data:
            kwargs['json'] = data
        return self.request('POST', endpoint, **kwargs)

    def patch(self, endpoint: str, data: Dict[Any, Any] = None, **kwargs) -> Dict[Any, Any]:
        if data:
            kwargs['json'] = data
        return self.request('PATCH', endpoint, **kwargs)

    def delete(self, endpoint: str, **kwargs) -> Dict[Any, Any]:
        return self.request('DELETE', endpoint, **kwargs)

    # Convenience methods
    def get_users(self):
        return self.get('/users')

    def get_database(self, database_id: str):
        return self.get(f'/databases/{database_id}')

    def query_database(self, database_id: str, query: Dict[Any, Any] = None):
        return self.post(f'/databases/{database_id}/query', query or {})

    def create_page(self, page_data: Dict[Any, Any]):
        return self.post('/pages', page_data)

    def get_page(self, page_id: str):
        return self.get(f'/pages/{page_id}')

# Flask integration
from flask import Flask, jsonify

app = Flask(__name__)
notion = NotionClient()

@app.errorhandler(NotionAPIError)
def handle_notion_error(error):
    return jsonify({
        'error': str(error),
        'status_code': error.status_code
    }), error.status_code if error.status_code else 500
```

## Authentication flow examples

### Testing authentication

For basic authentication testing, see the [Quickstart Guide](../quickstart/#test-your-api-connection). For production applications, consider these enhanced testing patterns:

## Advanced authentication errors

Beyond the [common issues covered in Quickstart](../quickstart/#common-issues), here are additional authentication scenarios:

| Status Code | Error | Advanced Cause | Solution |
|-------------|-------|-------|----------|
| **401** | `Unauthorized` | Token expired or revoked | Regenerate token and update all environments |
| **403** | `Forbidden` | Integration lacks specific capability | Review and update integration permissions |
| **429** | `Too Many Requests` | Sustained rate limit violations | Implement exponential backoff with jitter |

## Error handling patterns

### With exponential backoff

**JavaScript:**
```js
async function notionFetchWithRetry(endpoint, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await notionFetch(endpoint, options);
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

**Python:**
```python
import time
import random

def notion_request_with_retry(client, method, endpoint, max_retries=3, **kwargs):
    for attempt in range(max_retries + 1):
        try:
            return client.request(method, endpoint, **kwargs)
        except NotionAPIError as error:
            if error.status_code == 429 and attempt < max_retries:
                delay = min(2 ** attempt + random.uniform(0, 1), 10)
                print(f"Rate limited. Retrying in {delay:.1f}s...")
                time.sleep(delay)
                continue
            raise
```

## Security best practices

### Token storage
- **Development**: Use `.env` files (add to `.gitignore`)
- **Production**: Use secure environment variables or secret management systems
- **CI/CD**: Store in encrypted environment variables

### Token rotation
- Regularly regenerate integration tokens
- Update tokens in all environments simultaneously  
- Monitor for unauthorized token usage

### Least privilege
- Request only necessary permissions for your integration
- Use separate integrations for different use cases
- Regularly audit integration permissions

### Environment separation
```bash
# Development
NOTION_TOKEN=secret_dev_token_here
NOTION_VERSION=2022-02-22

# Production  
NOTION_TOKEN=secret_prod_token_here
NOTION_VERSION=2022-02-22

# Testing
NOTION_TOKEN=secret_test_token_here
NOTION_VERSION=2022-02-22
```

## Integration permissions

When creating integrations, configure appropriate capabilities:

| Permission | Use Case |
|------------|----------|
| **Read content** | Viewing pages, databases, and user info |
| **Update content** | Modifying existing pages and properties |
| **Insert content** | Creating new pages and database entries |
| **Read user information** | Accessing user profiles and workspace members |

## Troubleshooting authentication

### Advanced diagnostic checklist

For basic troubleshooting, see the [Quickstart Guide](../quickstart/#common-issues). For complex authentication issues:

1. **Token rotation**: Check if token was recently regenerated
2. **Multi-environment sync**: Ensure all environments have updated tokens
3. **Permission scope**: Verify integration has required capabilities
4. **Rate limiting**: Monitor for sustained high request volumes

### Debug logging

**JavaScript:**
```js
// Add debug logging to your auth helper
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export async function notionFetch(endpoint, options = {}) {
  if (DEBUG) {
    console.log('🔍 Notion API Request:', {
      endpoint,
      method: options.method || 'GET',
      headers: { ...options.headers, Authorization: '[REDACTED]' }
    });
  }
  
  // ... rest of implementation
}
```

**Python:**
```python
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG if os.getenv('DEBUG') else logging.INFO)
logger = logging.getLogger(__name__)

class NotionClient:
    def request(self, method: str, endpoint: str, **kwargs) -> Dict[Any, Any]:
        logger.debug(f"Notion API {method} {endpoint}")
        # ... rest of implementation
```

## Next steps

- [API Reference](../docs/guides/users) - Complete endpoint documentation
- Set up [Webhooks](/webhooks) for real-time updates
- Review [Error Handling](errors) for robust integration patterns  
- Build your first integration with the [Sample Apps](https://notion-api-doc.netlify.app/)
