# Quickstart

Get up and running in 10 minutes by setting up your Notion workspace, creating an integration, and making your first successful API request.

## Goal
- Set up a complete Notion development environment from scratch
- Create sample content to work with
- Configure your integration with proper permissions
- Make a test API call with required headers
- Confirm a 200 response and know how to fix common errors

## Complete Setup Guide

### Step 1: Set up your Notion account and workspace

If you don't already have a Notion account:

1. **Sign up for Notion**: Go to [notion.so](https://notion.so) and create a free account
2. **Create a new workspace** (recommended for API testing)

### Step 2: Create sample pages for testing

Create two different types of pages to test various API endpoints:

**A. Create a Normal Page:**
1. In your workspace, click "+ New page" 
2. Give it a title like "My Test Page"
3. Add some content:
   ```
   This is a sample page for testing the Notion API.
   ```
4. **Copy the page URL** - you'll need the page ID later
   - Example URL: `https://www.notion.so/My-Test-Page-25b2039cd2b680cfacc6dc2e70f8ccc6`
   - **Page ID**: `25b2039cd2b680cfacc6dc2e70f8ccc6` (32 characters after the last `-`)
   - 💡 **Note**: This page ID can also be used as a block ID for API operations

**B. Create a Database Page:**
1. Click "+ New page" again
2. Select "Database" → "Table"
3. Name it "My Test Database"
4. Set up some sample columns:
   - **Name** (Title) - already created
   - **Status** (Select) - add options: "Not Started", "In Progress", "Complete"
   - **Priority** (Select) - add options: "Low", "Medium", "High"  
   - **Due Date** (Date)
5. Add a few sample rows with different data
6. **Copy the database URL** - you'll need the database ID later
   - Example URL: `https://www.notion.so/25b2039cd2b680e582f7f0bef5b08486?v=25b2039cd2b680618452000c1b702a4b`
   - **Database ID**: `25b2039cd2b680e582f7f0bef5b08486` (first 32 characters before the `?`)

### Step 3: Create your Notion integration

1. **Go to integrations page**: Visit [https://www.notion.com/my-integrations](https://www.notion.com/my-integrations)

2. **Create new integration**:
   - Click "+ New integration"
   - **Integration name**: "Postman Docs Testing" (or your preferred name)
   - **Access scope**: Select "Team Workspace" or "Private" and select atleast the two pages you created in step 2.
   - **Integration type**: Choose "Internal integration"
   - Click "Submit"

3. **Configure capabilities** (give it full access for testing):
   - **Content Capabilities**: ✅ Check all boxes:
     - Read content
     - Update content  
     - Insert content
   - **Comment Capabilities**: ✅ Check:
     - Read comments
   - **User Capabilities**: ✅ Check:
     - Read user information including email addresses
   - Click "Save changes"

4. **Copy your integration token**:
   - In the "Secrets" section, click "Show" next to "Internal Integration Secret"
   - **Copy this token** - this is your `NOTION_TOKEN`
   - ⚠️ **Important**: Keep this secret secure and never commit it to version control

### Step 4: Collect your configuration values

You now have everything needed for API calls:

- **NOTION_TOKEN**: The integration secret from Step 3
- **NOTION_VERSION**: Use `2022-02-22` (current stable version)
- **PAGE_ID**: Extract from your test page URL (the 32-character string)
- **DATABASE_ID**: Extract from your database URL (the 32-character string)

**Finding IDs from URLs:**
- Page URL: `https://notion.so/My-Test-Page-abc123def456...` → PAGE_ID is `abc123def456...`
- Database URL: `https://notion.so/xyz789abc123...?v=...` → DATABASE_ID is `xyz789abc123...`

---

## Environment Setup

## Prerequisites ✅

If you followed the Complete Setup Guide above, you should now have:
- ✅ A Notion workspace with sample content
- ✅ An integration created and configured  
- ✅ Your NOTION_TOKEN (integration secret)
- ✅ PAGE_ID and DATABASE_ID from your test pages
- ✅ The API version string (NOTION_VERSION): `2022-02-22`

## Configure Environment Variables

Now let's set up your environment variables using the values from your setup:

**Mac/Linux (bash/zsh):**
```bash
export NOTION_TOKEN="secret_abc123..."  # Your integration secret from Step 3
export NOTION_VERSION="2022-02-22"
export PAGE_ID="abc123def456..."        # From your test page URL
export DATABASE_ID="xyz789abc123..."    # From your test database URL
```

**Windows PowerShell:**
```powershell
setx NOTION_TOKEN "secret_abc123..."    # Your integration secret from Step 3
setx NOTION_VERSION "2022-02-22"
setx PAGE_ID "abc123def456..."          # From your test page URL  
setx DATABASE_ID "xyz789abc123..."      # From your test database URL
# Close and reopen the terminal to load new environment variables
```

**Local-only shell session (recommended for testing):**
```bash
NOTION_TOKEN="secret_abc123..." \
NOTION_VERSION="2022-02-22" \
PAGE_ID="abc123def456..." \
DATABASE_ID="xyz789abc123..." \
bash
```

💡 **Tip**: Replace the example values above with your actual token and IDs from the setup steps.

## Test Your API Connection

Let's verify everything works with a simple test call:

```bash
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

**Expected result**: HTTP 200 with JSON describing your integration bot user.

✅ **Success!** Your integration is working. You can now retrieve your test page:
```bash
curl -s -X GET "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

## Quick JavaScript Example

```js
// Simple fetch example
const res = await fetch("https://api.notion.com/v1/users/me", {
  headers: {
    "Authorization": "Bearer " + import.meta.env.VITE_NOTION_TOKEN,
    "Notion-Version": "2022-02-22",
    "Content-Type": "application/json"
  }
});
const data = await res.json();
console.log("Integration info:", data);
```

## Quick Python Example

```python
import os
import requests

token = os.getenv("NOTION_TOKEN")
headers = {
    "Authorization": f"Bearer {token}",
    "Notion-Version": "2022-02-22",
    "Content-Type": "application/json"
}

# Test your integration
response = requests.get("https://api.notion.com/v1/users/me", headers=headers)
print("Integration info:", response.json())
```

## Common Errors and Solutions 🔧

### Authentication Errors
- **401 Unauthorized**: 
  - ✅ Verify your `NOTION_TOKEN` is correct (starts with `secret_`)
  - ✅ Ensure the integration has access to the workspace  
  - ✅ Check that pages/databases are shared with your integration

### Permission Errors  
- **403 Forbidden**:
  - ✅ Share the specific page/database with your integration
  - ✅ Go to the page → Share → Invite → Search for your integration name
  - ✅ Grant "Can edit" permissions

### API Version Issues
- **400/404 with version errors**:
  - ✅ Include the `Notion-Version` header in all requests
  - ✅ Use a supported version like `2022-02-22`
  - ✅ Ensure header is formatted correctly: `Notion-Version: 2022-02-22`

### Rate Limiting
- **429 Too Many Requests**:
  - ✅ Implement exponential backoff in your retry logic
  - ✅ Reduce request frequency during development/testing
  - ✅ Consider caching responses when possible

### ID Format Issues
- **Invalid page/database ID**:
  - ✅ IDs should be 32 characters (letters, numbers, dashes)
  - ✅ Extract from URL: `notion.so/page-abc123def456...` → `abc123def456...`
  - ✅ Remove any dashes from the URL format if present

### Environment Variable Issues  
- **Missing token errors**:
  - ✅ Restart your terminal after setting environment variables
  - ✅ Use `echo $NOTION_TOKEN` to verify the variable is set
  - ✅ For web apps, check `.env` file is in the correct location

## What's Next 🚀

🎉 **You're all set!** Your Notion integration is working and ready for development.

### Explore More:
- **[Working with Pages](../working-with-pages/)** - Read, update, and create page content
- **[Database Operations](../working-with-databases/)** - Query and modify database entries
- **[API Reference](../api-reference/)** - Complete endpoint documentation
- **[Code Examples](../examples/)** - More comprehensive JavaScript, Python, and other language examples

### Need Help?
- Check the **[Troubleshooting Guide](../troubleshooting/)** for common issues
- Join the **[Notion Developer Community](https://developers.notion.com/community)** for support

**Happy building!** 🚀
