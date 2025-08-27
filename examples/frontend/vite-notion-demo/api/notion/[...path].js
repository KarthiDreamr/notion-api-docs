/**
 * Vercel API Route - Notion API Proxy
 * Handles all Notion API requests to avoid CORS issues in production
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    
    // Build the Notion API URL
    const notionApiUrl = `https://api.notion.com/v1/${apiPath}`;
    
    // Get headers from the original request
    const headers = {
      'Content-Type': 'application/json',
      'Notion-Version': req.headers['notion-version'] || '2022-06-28'
    };

    // Add Authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Build request options
    const requestOptions = {
      method: req.method,
      headers,
    };

    // Add body for POST/PATCH requests
    if (req.method === 'POST' || req.method === 'PATCH') {
      requestOptions.body = JSON.stringify(req.body);
    }

    // Add query parameters for GET requests
    let finalUrl = notionApiUrl;
    if (req.method === 'GET' && Object.keys(req.query).length > 1) {
      const queryParams = new URLSearchParams();
      
      Object.entries(req.query).forEach(([key, value]) => {
        if (key !== 'path') {
          queryParams.append(key, value);
        }
      });
      
      if (queryParams.toString()) {
        finalUrl += `?${queryParams.toString()}`;
      }
    }

    console.log(`🔄 Proxying ${req.method} request to: ${finalUrl}`);

    // Make the request to Notion API
    const response = await fetch(finalUrl, requestOptions);
    const data = await response.json();

    // Return the response with the same status code
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({
      object: 'error',
      status: 500,
      code: 'internal_server_error',
      message: 'Failed to proxy request to Notion API: ' + error.message
    });
  }
} 