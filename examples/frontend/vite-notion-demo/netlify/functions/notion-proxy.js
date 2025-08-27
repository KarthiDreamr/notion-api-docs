/**
 * Netlify Function - Notion API Proxy
 * Handles all /api/notion/v1/* requests
 */

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract the API path from the URL
    // When axios makes a request like: /.netlify/functions/notion-proxy/users
    // We want to extract 'users' and forward it to https://api.notion.com/v1/users
    let apiPath = '';
    
    console.log('🔍 Raw event data:', {
      path: event.path,
      rawUrl: event.rawUrl,
      httpMethod: event.httpMethod,
      queryStringParameters: event.queryStringParameters
    });
    
    if (event.path) {
      // Remove the function base path to get the API endpoint
      const functionBasePath = '/.netlify/functions/notion-proxy';
      if (event.path.startsWith(functionBasePath)) {
        apiPath = event.path.substring(functionBasePath.length);
        // Remove leading slash if present
        if (apiPath.startsWith('/')) {
          apiPath = apiPath.substring(1);
        }
      }
    }
    
    console.log('🔍 Path parsing result:', {
      originalPath: event.path,
      extractedApiPath: apiPath,
      isEmpty: !apiPath
    });
    
    // Health check endpoints - only trigger for empty paths or explicit health checks
    if (!apiPath || apiPath === 'ping' || apiPath === 'health') {
      console.log('🏥 Returning health check response');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, name: 'notion-proxy', version: 'v1' })
      };
    }

    // Build the Notion API URL
    const notionApiUrl = `https://api.notion.com/v1/${apiPath}`;
    
    console.log(`🔄 Netlify Function - Making Notion API call:`, {
      method: event.httpMethod,
      path: apiPath,
      url: notionApiUrl,
      hasAuth: !!event.headers.authorization
    });
    
    // Build headers for Notion API request
    const notionHeaders = {
      'Content-Type': 'application/json',
      'Notion-Version': event.headers['notion-version'] || '2022-06-28'
    };

    // Use the API secret from environment variables
    const notionApiSecret = process.env.NOTION_API_SECRET;

    if (notionApiSecret) {
      console.log('✅ Found Netlify environment variable for Notion API secret.');
      notionHeaders.Authorization = `Bearer ${notionApiSecret}`;
    } else if (event.headers.authorization) {
      console.log('⚠️ Netlify environment variable not found. Using client Authorization header.');
      notionHeaders.Authorization = event.headers.authorization;
    } else {
      console.warn('❌ No Notion API token provided in environment or headers.');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          object: 'error',
          status: 401,
          code: 'unauthorized',
          message: 'No API token provided'
        })
      };
    }

    // Build request options
    const requestOptions = {
      method: event.httpMethod,
      headers: notionHeaders,
    };

    // Add body for POST/PATCH requests
    if (event.httpMethod === 'POST' || event.httpMethod === 'PATCH') {
      requestOptions.body = event.body;
    }

    // Add query parameters
    let finalUrl = notionApiUrl;
    if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      const queryString = new URLSearchParams(event.queryStringParameters).toString();
      finalUrl += `?${queryString}`;
    }

    // Make the request to Notion API
    const response = await fetch(finalUrl, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Notion API Error:`, {
        status: response.status,
        url: finalUrl,
        data: data
      });
    }

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        object: 'error',
        status: 500,
        code: 'internal_server_error',
        message: 'Failed to proxy request to Notion API: ' + error.message
      })
    };
  }
}; 