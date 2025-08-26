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

Alternatively, retrieve the bot user tied to your token:
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

## 3) Test call (JS fetch)

Create a small script (node >= 18) to verify headers and response parsing:
```js
// quickstart-test.js
const BASE_URL = "https://api.notion.com";
const token = process.env.NOTION_TOKEN;
const version = process.env.NOTION_VERSION || "2022-02-22";

if (!token) {
  throw new Error("NOTION_TOKEN is missing. Set it before running this script.");
}

async function main() {
  const res = await fetch(`${BASE_URL}/v1/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Notion-Version": version,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  console.log("✅ Success. First page of users:");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(err => {
  console.error("❌ Request failed:", err.message);
  process.exit(1);
});
```

Run:
```bash
node quickstart-test.js
```

## Common errors and fixes

- 401 unauthorized: Check NOTION_TOKEN value and that the integration has access to the workspace content being requested.  
- 400/404 with version issues: Ensure Notion-Version header is present and matches a supported date string (e.g., 2022-02-22).  
- 429 rate limited: Wait and retry with backoff; keep requests minimal during testing.  
- 403 permission errors: Share the target database/page with your integration and retry.  

## What’s next
- Set up the headers once in a reusable helper (see Auth basics).  
- Try a task guide: Query a database or Create a page with content.  
- Keep Postman variables and .env names aligned to avoid drift across examples.  