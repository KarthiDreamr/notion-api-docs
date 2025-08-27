---
title: Error Handling
sidebar_position: 10
slug: /errors
---

# Error Handling

Robust error handling is essential for building reliable integrations with the Notion API. This guide covers common errors, retry strategies, and monitoring patterns to ensure your application handles failures gracefully.

## HTTP status codes

The Notion API uses standard HTTP status codes to indicate success or failure:

| Status Code | Type | Meaning | Action Required |
|-------------|------|---------|-----------------|
| **200** | Success | Request completed successfully | Continue processing |
| **400** | Client Error | Bad Request - Invalid parameters or malformed payload | Fix request format |
| **401** | Client Error | Unauthorized - Invalid or missing authentication | Check token |
| **403** | Client Error | Forbidden - Insufficient permissions | Verify integration access |
| **404** | Client Error | Not Found - Resource doesn't exist | Check resource ID |
| **429** | Client Error | Too Many Requests - Rate limit exceeded | Implement exponential backoff |
| **500** | Server Error | Internal Server Error - Temporary server issue | Retry with backoff |
| **502** | Server Error | Bad Gateway - Server temporarily unavailable | Retry with backoff |
| **503** | Server Error | Service Unavailable - Service temporarily down | Retry with backoff |

## Error response format

All error responses follow this consistent structure:

```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Path failed validation: path.page_id should be a valid uuid, instead was `\"invalid-page-id\"`.",
  "request_id": "be72f9b6-9158-4c32-9a40-5678abcd1234"
}
```

### Common error codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `unauthorized` | Authentication failed | Invalid token, missing Authorization header |
| `restricted_resource` | Insufficient permissions | Integration not shared with resource |
| `object_not_found` | Resource not found | Invalid ID, resource deleted |
| `conflict_error` | Resource conflict | Concurrent modification |
| `rate_limited` | Rate limit exceeded | Too many requests |
| `invalid_request` | Bad request format | Missing required fields, invalid JSON |
| `validation_error` | Parameter validation failed | Invalid parameter values or types |
| `service_unavailable` | Temporary service issue | Server maintenance or outage |

## Error classification

### Retriable errors (temporary failures)
These errors should be retried with exponential backoff:

- **429** - Rate limited
- **500** - Internal server error  
- **502** - Bad gateway
- **503** - Service unavailable
- Network timeouts and connection errors

### Non-retriable errors (permanent failures)
These errors should not be retried:

- **400** - Bad request (fix the request)
- **401** - Unauthorized (check credentials)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found (check resource ID)
- **422** - Unprocessable entity (invalid data)

## Error handling implementations

### JavaScript (Vite) error handler

```js
// utils/error-handler.js
export class NotionAPIError extends Error {
  constructor(status, code, message, requestId = null) {
    super(message);
    this.name = 'NotionAPIError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.retriable = this.isRetriable(status);
  }

  isRetriable(status) {
    return [429, 500, 502, 503, 504].includes(status);
  }
}

export async function handleNotionResponse(response) {
  if (response.ok) {
    return await response.json();
  }

  let errorData;
  try {
    errorData = await response.json();
  } catch (e) {
    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
  }

  throw new NotionAPIError(
    response.status,
    errorData.code || 'unknown_error',
    errorData.message || `HTTP ${response.status} error`,
    errorData.request_id
  );
}

export async function notionFetchWithRetry(
  url, 
  options = {}, 
  maxRetries = 3,
  baseDelay = 1000
) {
  const token = import.meta.env.VITE_NOTION_TOKEN;
  const version = import.meta.env.VITE_NOTION_VERSION || '2022-02-22';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': version,
    'Content-Type': 'application/json',
    ...options.headers
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers });
      return await handleNotionResponse(response);
      
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      // Don't retry non-retriable errors
      if (error instanceof NotionAPIError && !error.retriable) {
        throw error;
      }

      // Don't retry if this is the last attempt
      if (isLastAttempt) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        30000 // Cap at 30 seconds
      );

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, {
        error: error.message,
        status: error.status,
        retriable: error.retriable
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage examples
export const notionAPI = {
  async getUsers() {
    return notionFetchWithRetry('https://api.notion.com/v1/users');
  },

  async queryDatabase(databaseId, query = {}) {
    return notionFetchWithRetry(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        body: JSON.stringify(query)
      }
    );
  },

  async createPage(pageData) {
    return notionFetchWithRetry(
      'https://api.notion.com/v1/pages',
      {
        method: 'POST',
        body: JSON.stringify(pageData)
      }
    );
  }
};
```

### Python (Flask) error handler

```python
# utils/error_handler.py
import time
import random
import logging
import requests
from typing import Dict, Any, Optional, Union
from functools import wraps

logger = logging.getLogger(__name__)

class NotionAPIError(Exception):
    """Custom exception for Notion API errors."""
    
    def __init__(
        self, 
        status_code: int, 
        error_code: str, 
        message: str, 
        request_id: Optional[str] = None,
        response: Optional[requests.Response] = None
    ):
        super().__init__(message)
        self.status_code = status_code
        self.error_code = error_code
        self.request_id = request_id
        self.response = response
        self.retriable = self._is_retriable(status_code)
    
    def _is_retriable(self, status_code: int) -> bool:
        """Determine if the error is retriable."""
        return status_code in [429, 500, 502, 503, 504]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for JSON responses."""
        return {
            'error': {
                'status': self.status_code,
                'code': self.error_code,
                'message': str(self),
                'request_id': self.request_id,
                'retriable': self.retriable
            }
        }

def handle_notion_response(response: requests.Response) -> Dict[str, Any]:
    """Handle Notion API response and raise appropriate errors."""
    if response.ok:
        return response.json()
    
    try:
        error_data = response.json()
        error_code = error_data.get('code', 'unknown_error')
        message = error_data.get('message', f'HTTP {response.status_code} error')
        request_id = error_data.get('request_id')
    except ValueError:
        error_code = 'unknown_error'
        message = f'HTTP {response.status_code}: {response.text[:200]}'
        request_id = None
    
    raise NotionAPIError(
        status_code=response.status_code,
        error_code=error_code,
        message=message,
        request_id=request_id,
        response=response
    )

def with_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    backoff_factor: float = 2.0
):
    """Decorator for retrying functions with exponential backoff."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except NotionAPIError as error:
                    last_error = error
                    
                    # Don't retry non-retriable errors
                    if not error.retriable:
                        logger.error(f"Non-retriable error: {error}")
                        raise
                    
                    # Don't retry on last attempt
                    if attempt == max_retries:
                        break
                    
                    # Calculate delay with exponential backoff and jitter
                    delay = min(
                        base_delay * (backoff_factor ** attempt) + random.uniform(0, 1),
                        max_delay
                    )
                    
                    logger.warning(
                        f"Attempt {attempt + 1} failed, retrying in {delay:.1f}s: {error}"
                    )
                    time.sleep(delay)
                    
                except Exception as error:
                    logger.error(f"Unexpected error: {error}")
                    raise
            
            # All retries exhausted
            logger.error(f"All {max_retries} retries exhausted. Last error: {last_error}")
            raise last_error
        
        return wrapper
    return decorator

class NotionClient:
    """Notion API client with built-in error handling and retries."""
    
    def __init__(self, token: Optional[str] = None, version: Optional[str] = None):
        import os
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

    @with_retry(max_retries=3, base_delay=1.0)
    def _request(
        self, 
        method: str, 
        endpoint: str, 
        **kwargs
    ) -> Dict[str, Any]:
        """Make authenticated request to Notion API."""
        url = f"{self.base_url}{endpoint}"
        
        logger.debug(f"Making {method} request to {url}")
        
        try:
            response = self.session.request(method, url, **kwargs)
            return handle_notion_response(response)
            
        except requests.exceptions.Timeout:
            raise NotionAPIError(
                status_code=408,
                error_code='timeout',
                message='Request timed out'
            )
        except requests.exceptions.ConnectionError:
            raise NotionAPIError(
                status_code=503,
                error_code='connection_error', 
                message='Connection error'
            )
        except requests.exceptions.RequestException as e:
            raise NotionAPIError(
                status_code=0,
                error_code='request_error',
                message=f'Request failed: {str(e)}'
            )

    def get(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('GET', endpoint, **kwargs)

    def post(self, endpoint: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        if data:
            kwargs['json'] = data
        return self._request('POST', endpoint, **kwargs)

    def patch(self, endpoint: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        if data:
            kwargs['json'] = data
        return self._request('PATCH', endpoint, **kwargs)

    def delete(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('DELETE', endpoint, **kwargs)

    # Convenience methods with error handling
    def get_users(self):
        return self.get('/users')

    def query_database(self, database_id: str, query: Dict[str, Any] = None):
        return self.post(f'/databases/{database_id}/query', query or {})

    def create_page(self, page_data: Dict[str, Any]):
        return self.post('/pages', page_data)

# Flask integration
from flask import Flask, jsonify, request

app = Flask(__name__)
notion = NotionClient()

@app.errorhandler(NotionAPIError)
def handle_notion_api_error(error):
    """Global error handler for Notion API errors."""
    logger.error(f"Notion API error: {error}")
    return jsonify(error.to_dict()), error.status_code if error.status_code else 500

@app.errorhandler(Exception)
def handle_general_error(error):
    """Global error handler for unexpected errors."""
    logger.error(f"Unexpected error: {error}", exc_info=True)
    return jsonify({
        'error': {
            'status': 500,
            'code': 'internal_error',
            'message': 'Internal server error'
        }
    }), 500
```

## Rate limiting strategies

### Handling 429 responses

```js
// Rate limit handler with token bucket algorithm
class RateLimiter {
  constructor(maxTokens = 3, refillRate = 1) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async acquire() {
    this.refill();
    
    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
    
    this.tokens -= 1;
    return true;
  }

  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + timePassed * this.refillRate
    );
    this.lastRefill = now;
  }
}

const rateLimiter = new RateLimiter();

export async function rateLimitedFetch(url, options) {
  await rateLimiter.acquire();
  return notionFetchWithRetry(url, options);
}
```

### Python rate limiting with circuit breaker

```python
import time
from enum import Enum
from threading import Lock

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    """Circuit breaker pattern for API calls."""
    
    def __init__(
        self, 
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        expected_exception: type = NotionAPIError
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        self._lock = Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.state = CircuitState.HALF_OPEN
                else:
                    raise NotionAPIError(
                        status_code=503,
                        error_code='circuit_breaker_open',
                        message='Circuit breaker is open'
                    )

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.expected_exception as e:
            self._on_failure()
            raise

    def _should_attempt_reset(self) -> bool:
        return (
            self.last_failure_time and
            time.time() - self.last_failure_time >= self.recovery_timeout
        )

    def _on_success(self):
        with self._lock:
            self.failure_count = 0
            self.state = CircuitState.CLOSED

    def _on_failure(self):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN

# Usage
circuit_breaker = CircuitBreaker()

def safe_notion_call(func, *args, **kwargs):
    return circuit_breaker.call(func, *args, **kwargs)
```

## Error monitoring and alerting

### JavaScript error tracking

```js
// utils/error-tracking.js
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.errorCounts = new Map();
    this.lastReset = Date.now();
  }

  track(error) {
    const errorKey = `${error.status}_${error.code}`;
    
    // Track error occurrence
    this.errors.push({
      timestamp: Date.now(),
      status: error.status,
      code: error.code,
      message: error.message,
      requestId: error.requestId
    });

    // Update error counts
    this.errorCounts.set(
      errorKey, 
      (this.errorCounts.get(errorKey) || 0) + 1
    );

    // Reset counts every hour
    if (Date.now() - this.lastReset > 3600000) {
      this.reset();
    }

    // Check for alert conditions
    this.checkAlertConditions(errorKey);
  }

  checkAlertConditions(errorKey) {
    const count = this.errorCounts.get(errorKey);
    
    // Alert on high error rate
    if (count >= 10) {
      this.sendAlert(`High error rate: ${errorKey} occurred ${count} times`);
    }

    // Alert on critical errors
    if (errorKey.startsWith('401') || errorKey.startsWith('403')) {
      this.sendAlert(`Authentication issue: ${errorKey}`);
    }
  }

  sendAlert(message) {
    console.error(`🚨 ALERT: ${message}`);
    
    // Send to monitoring service
    if (window.Sentry) {
      window.Sentry.captureMessage(message, 'error');
    }
  }

  reset() {
    this.errorCounts.clear();
    this.lastReset = Date.now();
  }

  getStats() {
    return {
      totalErrors: this.errors.length,
      errorCounts: Object.fromEntries(this.errorCounts),
      recentErrors: this.errors.slice(-10)
    };
  }
}

export const errorTracker = new ErrorTracker();
```

### Python logging configuration

```python
# utils/logging_config.py
import logging
import sys
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcfromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 
                          'pathname', 'filename', 'module', 'lineno', 
                          'funcName', 'created', 'msecs', 'relativeCreated', 
                          'thread', 'threadName', 'processName', 'process',
                          'exc_info', 'exc_text', 'stack_info']:
                log_entry[key] = value
        
        return json.dumps(log_entry)

def setup_logging(level=logging.INFO, log_file='notion_api.log'):
    """Setup logging configuration."""
    
    # Create root logger
    logger = logging.getLogger()
    logger.setLevel(level)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=5
    )
    file_handler.setLevel(level)
    file_formatter = JSONFormatter()
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    return logger

# Error tracking middleware for Flask
from flask import g, request
import time

def track_errors(app):
    """Add error tracking to Flask app."""
    
    @app.before_request
    def before_request():
        g.start_time = time.time()
        g.request_id = request.headers.get('X-Request-ID', 'unknown')

    @app.after_request
    def after_request(response):
        duration = time.time() - g.start_time
        
        logger.info(
            f"{request.method} {request.path} {response.status_code}",
            extra={
                'request_id': g.request_id,
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': duration,
                'user_agent': request.headers.get('User-Agent'),
                'ip': request.remote_addr
            }
        )
        
        return response

logger = setup_logging()
```

## Testing error scenarios

### Unit tests for error handling

```js
// tests/error-handling.test.js
import { describe, it, expect, vi } from 'vitest';
import { notionFetchWithRetry, NotionAPIError } from '../utils/error-handler.js';

describe('Error Handling', () => {
  it('should retry on 429 rate limit', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new NotionAPIError(429, 'rate_limited', 'Rate limited'))
      .mockResolvedValueOnce({ ok: true, json: () => ({ success: true }) });
    
    global.fetch = mockFetch;
    
    const result = await notionFetchWithRetry('/test');
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ success: true });
  });

  it('should not retry on 400 bad request', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValue(new NotionAPIError(400, 'bad_request', 'Bad request'));
    
    global.fetch = mockFetch;
    
    await expect(notionFetchWithRetry('/test')).rejects.toThrow('Bad request');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

### Python error handling tests

```python
# tests/test_error_handling.py
import pytest
import requests
from unittest.mock import Mock, patch
from utils.error_handler import NotionClient, NotionAPIError

def test_retry_on_rate_limit():
    """Test that rate limits trigger retries."""
    client = NotionClient(token='test-token')
    
    # Mock response sequence: rate limit -> success
    mock_response_429 = Mock()
    mock_response_429.ok = False
    mock_response_429.status_code = 429
    mock_response_429.json.return_value = {
        'code': 'rate_limited',
        'message': 'Rate limited'
    }
    
    mock_response_200 = Mock()
    mock_response_200.ok = True
    mock_response_200.json.return_value = {'success': True}
    
    with patch.object(client.session, 'request') as mock_request:
        mock_request.side_effect = [mock_response_429, mock_response_200]
        
        result = client.get('/test')
        
        assert mock_request.call_count == 2
        assert result == {'success': True}

def test_no_retry_on_bad_request():
    """Test that 400 errors don't trigger retries."""
    client = NotionClient(token='test-token')
    
    mock_response = Mock()
    mock_response.ok = False
    mock_response.status_code = 400
    mock_response.json.return_value = {
        'code': 'bad_request',
        'message': 'Bad request'
    }
    
    with patch.object(client.session, 'request') as mock_request:
        mock_request.return_value = mock_response
        
        with pytest.raises(NotionAPIError) as exc_info:
            client.get('/test')
        
        assert mock_request.call_count == 1
        assert exc_info.value.status_code == 400
        assert not exc_info.value.retriable
```

## Error handling best practices

1. **Classify errors correctly**: Distinguish between retriable and non-retriable errors
2. **Implement exponential backoff**: Use increasing delays between retries
3. **Set reasonable retry limits**: Avoid infinite retry loops
4. **Log errors appropriately**: Include relevant context and request IDs
5. **Monitor error rates**: Set up alerts for unusual error patterns
6. **Provide user-friendly messages**: Don't expose internal error details
7. **Handle edge cases**: Account for network timeouts and connection errors
8. **Test error scenarios**: Include error cases in your test suites
9. **Use circuit breakers**: Prevent cascading failures in distributed systems
10. **Document error responses**: Help developers understand and handle errors

## Troubleshooting common issues

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| Frequent 401s | Token expired or invalid | Regenerate integration token |
| Frequent 403s | Missing permissions | Share integration with resources |
| Frequent 429s | Exceeding rate limits | Implement better rate limiting |
| Random 404s | Using invalid IDs | Validate IDs before making requests |
| Timeout errors | Network or server issues | Increase timeout, implement retries |

## Next steps

- Implement comprehensive error handling in your [Sample Apps](https://notion-api-doc.netlify.app/)
- Set up monitoring and alerting for your integration
- Create error handling documentation for your team
- Test error scenarios in your development environment