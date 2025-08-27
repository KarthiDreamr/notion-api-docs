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

Now let's verify everything is working with some test API calls:

### Basic Connection Tests (curl)

**1. List users (simple sanity check):**
```bash
curl -s -X GET "https://api.notion.com/v1/users" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

**2. Retrieve your integration info:**
```bash
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

### Test Your Sample Content

**3. Retrieve your test page:**
```bash
curl -s -X GET "https://api.notion.com/v1/pages/${PAGE_ID}" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json"
```

**4. Query your test database:**
```bash
curl -s -X POST "https://api.notion.com/v1/databases/${DATABASE_ID}/query" \
  -H "Authorization: Bearer ${NOTION_TOKEN}" \
  -H "Notion-Version: ${NOTION_VERSION}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Expected Results ✅
- **HTTP 200** status for all requests
- `/v1/users`: JSON with `results` array containing user objects
- `/v1/users/me`: JSON describing your integration bot user
- `/v1/pages/${PAGE_ID}`: JSON with your test page data and properties
- `/v1/databases/${DATABASE_ID}/query`: JSON with `results` array containing your database rows

## JavaScript Example (Frontend)

Create a comprehensive frontend example that tests your setup:

```js
// main.js - Complete API testing example
const BASE_URL = "https://api.notion.com/v1";
const config = {
  token: import.meta.env.VITE_NOTION_TOKEN,
  version: import.meta.env.VITE_NOTION_VERSION || "2022-02-22",
  pageId: import.meta.env.VITE_PAGE_ID,
  databaseId: import.meta.env.VITE_DATABASE_ID
};

// Helper function for API calls
async function notionFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${config.token}`,
      "Notion-Version": config.version,
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

// Test functions
async function testConnection() {
  console.log("🔗 Testing basic connection...");
  const users = await notionFetch("/users");
  console.log("✅ Users fetched:", users.results?.length || 0);
}

async function testPageRetrieval() {
  console.log("📄 Testing page retrieval...");
  const page = await notionFetch(`/pages/${config.pageId}`);
  console.log("✅ Page retrieved:", page.properties?.title?.title?.[0]?.plain_text || "Untitled");
}

async function testDatabaseQuery() {
  console.log("🗃️ Testing database query...");
  const results = await notionFetch(`/databases/${config.databaseId}/query`, {
    method: "POST",
    body: JSON.stringify({})
  });
  console.log("✅ Database queried:", results.results?.length || 0, "rows found");
}

// Run all tests
async function runTests() {
  try {
    await testConnection();
    await testPageRetrieval();
    await testDatabaseQuery();
    console.log("🎉 All tests passed!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

runTests();
```

**Environment file (.env.local for Vite):**
```bash
VITE_NOTION_TOKEN=secret_abc123...
VITE_NOTION_VERSION=2022-02-22
VITE_PAGE_ID=abc123def456...
VITE_DATABASE_ID=xyz789abc123...
```

## Python Example (Flask Backend)

Create a comprehensive Flask app that tests all your Notion setup:

```python
# app.py - Complete Notion API testing server
import os
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

# Configuration from environment variables
config = {
    'token': os.getenv("NOTION_TOKEN"),
    'version': os.getenv("NOTION_VERSION", "2022-02-22"),
    'page_id': os.getenv("PAGE_ID"),
    'database_id': os.getenv("DATABASE_ID")
}

BASE_URL = "https://api.notion.com/v1"

def notion_request(method, endpoint, data=None):
    """Helper function for Notion API requests"""
    headers = {
        "Authorization": f"Bearer {config['token']}",
        "Notion-Version": config['version'],
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}{endpoint}"
    response = requests.request(method, url, headers=headers, json=data)
    
    try:
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError:
        return {
            'error': f'HTTP {response.status_code}',
            'message': response.text
        }, response.status_code

@app.route('/')
def index():
    """Test overview page"""
    return jsonify({
        'message': 'Notion API Test Server',
        'endpoints': {
            '/users': 'List workspace users',
            '/me': 'Get integration info', 
            '/test-page': 'Retrieve your test page',
            '/test-database': 'Query your test database',
            '/run-tests': 'Run all tests at once'
        }
    })

@app.route('/users')
def list_users():
    """Test basic user listing"""
    return notion_request('GET', '/users')

@app.route('/me') 
def get_me():
    """Test integration info retrieval"""
    return notion_request('GET', '/users/me')

@app.route('/test-page')
def get_test_page():
    """Test retrieving your sample page"""
    if not config['page_id']:
        return jsonify({'error': 'PAGE_ID environment variable not set'}), 400
    return notion_request('GET', f"/pages/{config['page_id']}")

@app.route('/test-database')
def query_test_database():
    """Test querying your sample database"""
    if not config['database_id']:
        return jsonify({'error': 'DATABASE_ID environment variable not set'}), 400
    return notion_request('POST', f"/databases/{config['database_id']}/query", {})

@app.route('/run-tests')
def run_all_tests():
    """Run all tests and return comprehensive results"""
    results = {}
    
    # Test 1: List users
    users_result = notion_request('GET', '/users')
    results['users_test'] = {
        'status': 'success' if isinstance(users_result, dict) and 'results' in users_result else 'failed',
        'user_count': len(users_result.get('results', [])) if isinstance(users_result, dict) else 0
    }
    
    # Test 2: Get integration info  
    me_result = notion_request('GET', '/users/me')
    results['integration_test'] = {
        'status': 'success' if isinstance(me_result, dict) and 'name' in me_result else 'failed',
        'integration_name': me_result.get('name') if isinstance(me_result, dict) else None
    }
    
    # Test 3: Get test page (if configured)
    if config['page_id']:
        page_result = notion_request('GET', f"/pages/{config['page_id']}")
        results['page_test'] = {
            'status': 'success' if isinstance(page_result, dict) and 'properties' in page_result else 'failed',
            'page_title': page_result.get('properties', {}).get('title', {}).get('title', [{}])[0].get('plain_text') if isinstance(page_result, dict) else None
        }
    
    # Test 4: Query test database (if configured)  
    if config['database_id']:
        db_result = notion_request('POST', f"/databases/{config['database_id']}/query", {})
        results['database_test'] = {
            'status': 'success' if isinstance(db_result, dict) and 'results' in db_result else 'failed',
            'row_count': len(db_result.get('results', [])) if isinstance(db_result, dict) else 0
        }
    
    # Overall status
    all_passed = all(test.get('status') == 'success' for test in results.values())
    results['overall'] = {
        'status': 'all_tests_passed' if all_passed else 'some_tests_failed',
        'message': '🎉 All tests passed!' if all_passed else '⚠️ Some tests failed - check individual results'
    }
    
    return jsonify(results)

if __name__ == '__main__':
    # Validate required environment variables
    if not config['token']:
        print("❌ NOTION_TOKEN environment variable is required")
        exit(1)
        
    print("🚀 Starting Notion API test server...")
    print("📝 Available endpoints:")
    print("  - http://localhost:5000/run-tests (comprehensive test)")
    print("  - http://localhost:5000/users")  
    print("  - http://localhost:5000/me")
    if config['page_id']:
        print("  - http://localhost:5000/test-page")
    if config['database_id']:
        print("  - http://localhost:5000/test-database")
    
    app.run(port=5000, debug=True)
```

**Requirements (requirements.txt):**
```txt
Flask==2.3.3
requests==2.31.0
```

**Install and run:**
```bash
pip install -r requirements.txt
python app.py
# Visit http://localhost:5000/run-tests to test everything
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

Congratulations! You now have a complete Notion API development environment. Here are your next steps:

### Immediate Next Steps
1. **Experiment** with the provided code examples
2. **Modify** the JavaScript/Python examples to try different API endpoints  
3. **Explore** the [API Reference](../api-reference/) to discover more capabilities

### Recommended Learning Path
1. **[Authentication Guide](../auth/)** - Learn about different auth methods and security best practices
2. **[Working with Pages](../working-with-pages/)** - Deep dive into page content manipulation
3. **[Database Operations](../working-with-databases/)** - Advanced database queries and updates
4. **[Webhooks](../webhooks/)** - Real-time notifications for your integrations

### Development Tips
- **Use the Flask app** (`/run-tests` endpoint) as a backend API playground
- **Use the JavaScript example** as a frontend testing environment
- **Create additional test pages** in your workspace as you learn new concepts
- **Join the [Notion Developer Community](https://developers.notion.com/community)** for support and inspiration

### Ready to Build?
Your integration is now configured and ready for real development. Start building something awesome! 🎯
