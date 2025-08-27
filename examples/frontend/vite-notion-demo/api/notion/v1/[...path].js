/**
 * Vercel API Route - Notion API Proxy
 * Direct path: /api/notion/v1/[...path]
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
    const apiPath = Array.isArray(path) ? path.join('/') : (path || '');
    
    // Health check endpoints
    if (!apiPath || apiPath === 'ping' || apiPath === 'health') {
      res.status(200).json({ ok: true, name: 'notion-proxy', version: 'v1' });
      return;
    }

    // Build the Notion API URL
    const notionApiUrl = `https://api.notion.com/v1/${apiPath}`;
    
    console.log(`🔄 API Proxy [v1]:`, {
      method: req.method,
      path: apiPath,
      url: notionApiUrl,
      hasAuth: !!req.headers.authorization
    });
    
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

    // Add query parameters for GET requests (excluding 'path' parameter)
    let finalUrl = notionApiUrl;
    if (req.method === 'GET' && req.query) {
      const queryParams = new URLSearchParams();
      
      Object.entries(req.query).forEach(([key, value]) => {
        if (key !== 'path' && !Array.isArray(value)) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }

    // Make the request to Notion API
    const response = await fetch(finalUrl, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Notion API Error [v1]:`, {
        status: response.status,
        url: finalUrl,
        data: data
      });
    }

    // Return the response with the same status code
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Proxy error [v1]:', error);
    res.status(500).json({
      object: 'error',
      status: 500,
      code: 'internal_server_error',
      message: 'Failed to proxy request to Notion API: ' + error.message
    });
  }
} 