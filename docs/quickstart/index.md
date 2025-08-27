# Quickstart

Get up and running in 10 minutes by configuring a token, setting the API version header, and making a successful request to the Notion API.

## Goal
- Configure environment variables.
- Make a test API call with required headers.
- Confirm a 200 response and know how to fix common errors.

## Prerequisites
- A Notion integration token (NOTION_TOKEN).
- The API version string (NOTION_VERSION), for example: 2022-02-22.
- Optional: DATABASE_ID, PAGE_ID if planning to run the later task guides.

## 1) Set environment variables

Mac/Linux (bash/zsh):
```bash
export NOTION_TOKEN="<paste_your_token_here>"
export NOTION_VERSION="2022-02-22"
```

Windows PowerShell:
```powershell
setx NOTION_TOKEN "<paste_your_token_here>"
setx NOTION_VERSION "2022-02-22"
# Close and reopen the terminal to load new environment variables
```

Local-only shell session (recommended for testing):
```bash
NOTION_TOKEN="<paste_your_token_here>" \
NOTION_VERSION="2022-02-22" \
bash
```

## 2) Test call (curl)

List users (simple sanity check):
```bash
curl -s -X GET "https://api.notion.com/v1/users" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

Retrieve the bot user tied to your token:
```bash
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

Expected success indicators:
- HTTP 200
- For /v1/users: a JSON object containing results (array of user objects).
- For /v1/users/me: a JSON object describing your bot user.

## 3) Test call (JavaScript - Vanilla JS + Vite frontend)

Create a minimal frontend fetch example:
```js
// main.js
const BASE_URL = "https://api.notion.com";
const token = import.meta.env.VITE_NOTION_TOKEN;
const version = import.meta.env.VITE_NOTION_VERSION || "2022-02-22";

async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/v1/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Notion-Version": version,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log("✅ Users fetched:", data);
  return data;
}

fetchUsers().catch(err => {
  console.error("❌ Fetch failed:", err.message);
});
```

## 4) Test call (Python - Flask backend)

Minimal example to fetch users server-side:
```python
# app.py
import os
import requests
from flask import Flask, jsonify

app = Flask(__name__)

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_VERSION = os.getenv("NOTION_VERSION", "2022-02-22")

@app.route('/users')
def list_users():
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }
    response = requests.get('https://api.notion.com/v1/users', headers=headers)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return jsonify({'error': str(e), 'body': response.text}), response.status_code
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

## Common errors and fixes
- 401 unauthorized: Check NOTION_TOKEN value and that the integration has access to the workspace content being requested.
- 400/404 with version issues: Ensure Notion-Version header is present and matches a supported date string (e.g., 2022-02-22).
- 429 rate limited: Wait and retry with backoff; keep requests minimal during testing.
- 403 permission errors: Share the target database/page with your integration and retry.

## What's next
- Use the frontend main.js as a playground for JS fetch calls.
- Use the Flask app.py as a backend playground and webhook base.
- Proceed with Auth basics page for headers, tokens, and helpers.
