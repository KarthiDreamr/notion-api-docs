---
title: Users API
sidebar_position: 3
slug: /guides/users
---

# Users API

The Users API lets you retrieve information about users in your Notion workspace. This includes workspace members and your integration's bot user.

## Available endpoints

- **List all users** - `GET /v1/users`
- **Retrieve a specific user** - `GET /v1/users/:id` 
- **Retrieve bot user** - `GET /v1/users/me`

## Required headers

All Users API requests require:
- `Authorization: Bearer <your_notion_token>`
- `Notion-Version: <version>` (e.g., "2022-02-22")

## List all users

Returns a paginated list of all users in the workspace.

**Endpoint:** `GET /v1/users`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/users" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function listUsers() {
  const response = await fetch('https://api.notion.com/v1/users', {
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

def list_users():
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get('https://api.notion.com/v1/users', headers=headers)
    response.raise_for_status()
    return response.json()
```

### Response example
```json
{
  "object": "list",
  "results": [
    {
      "object": "user",
      "id": "6794760a-1f15-45cd-9c65-0dfe42f5135a",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "type": "person",
      "person": {
        "email": "john@example.com"
      }
    }
  ],
  "next_cursor": null,
  "has_more": false
}
```

## Retrieve a specific user

Get details for a specific user by their ID.

**Endpoint:** `GET /v1/users/:id`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/users/${USER_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getUser(userId) {
  const response = await fetch(`https://api.notion.com/v1/users/${userId}`, {
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
def get_user(user_id):
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get(f'https://api.notion.com/v1/users/{user_id}', headers=headers)
    response.raise_for_status()
    return response.json()
```

## Retrieve bot user

Get information about your integration's bot user. Useful for verifying authentication.

**Endpoint:** `GET /v1/users/me`

### Example requests

**curl:**
```bash
curl -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}"
```

**JavaScript (Vite):**
```js
async function getBotUser() {
  const response = await fetch('https://api.notion.com/v1/users/me', {
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
def get_bot_user():
    headers = {
        'Authorization': f"Bearer {os.getenv('NOTION_TOKEN')}",
        'Notion-Version': os.getenv('NOTION_VERSION', '2022-02-22')
    }
    
    response = requests.get('https://api.notion.com/v1/users/me', headers=headers)
    response.raise_for_status()
    return response.json()
```

### Response example
```json
{
  "object": "user",
  "id": "6794760a-1f15-45cd-9c65-0dfe42f5135a",
  "name": "My Integration Bot",
  "avatar_url": null,
  "type": "bot",
  "bot": {
    "owner": {
      "type": "workspace",
      "workspace": true
    },
    "workspace_name": "My Workspace"
  }
}
```

## Error handling

Common error responses:

- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Token doesn't have access to the workspace
- **404 Not Found**: User ID doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

Always implement retry logic with exponential backoff for 429 and 5xx errors.

## Next steps

- Learn about [Database operations](/docs/guides/databases) to work with Notion databases
- Set up [Webhooks](/docs/webhooks) to receive real-time updates
- Review [Error handling](/docs/errors) best practices
