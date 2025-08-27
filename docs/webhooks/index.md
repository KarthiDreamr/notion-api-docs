---
title: Webhooks
sidebar_position: 9
slug: /webhooks
---

# Webhooks

Webhooks allow you to receive real-time notifications when content changes in Notion. Instead of polling the API, your application can be notified immediately when pages, databases, or other resources are created, updated, or deleted.

## Overview

- **Real-time updates**: Get notified instantly when Notion content changes
- **Event-driven architecture**: Build reactive applications that respond to changes
- **Reduced API calls**: Eliminate the need for polling to detect changes
- **Secure delivery**: Webhooks include signature verification for security

## Webhook events

Notion sends webhook events for these types of changes:

| Event Type | Triggered When |
|------------|----------------|
| `page.created` | A new page is created |
| `page.updated` | Page properties or content changes |
| `page.deleted` | A page is moved to trash |
| `database.created` | A new database is created |
| `database.updated` | Database properties or schema changes |
| `block.created` | New blocks are added to pages |
| `block.updated` | Block content is modified |
| `block.deleted` | Blocks are removed from pages |

## Setting up webhooks

### 1. Create a webhook endpoint

Your webhook endpoint must:
- Accept POST requests
- Return a 200 status code for successful processing
- Verify the webhook signature (recommended)
- Be accessible from the internet (use ngrok for local development)

### 2. Subscribe to events

Configure your integration to send webhooks to your endpoint URL through the Notion integration settings.

## Webhook payload structure

All webhook events follow this structure:

```json
{
  "object": "event",
  "id": "event-id-here",
  "created_time": "2022-02-15T22:34:54.046Z",
  "event_type": "page.updated",
  "data": {
    "object": "page",
    "id": "page-id-here",
    // ... page data
  }
}
```

## Webhook handlers

### JavaScript (Express/Node.js) handler

```js
// webhook-handler.js
import express from 'express';
import crypto from 'crypto';
import { processPageUpdate, processPageCreation } from './notion-handlers.js';

const app = express();

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));

// Webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(`sha256=${expectedSignature}`, 'utf8')
  );
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.get('X-Notion-Signature');
    const webhookSecret = process.env.NOTION_WEBHOOK_SECRET;

    // Verify signature (recommended for production)
    if (webhookSecret && !verifyWebhookSignature(req.body, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    
    console.log(`📨 Received webhook: ${event.event_type}`);

    // Handle different event types
    switch (event.event_type) {
      case 'page.created':
        await processPageCreation(event.data);
        break;

      case 'page.updated':
        await processPageUpdate(event.data);
        break;

      case 'page.deleted':
        console.log(`🗑️ Page deleted: ${event.data.id}`);
        break;

      case 'database.updated':
        console.log(`📊 Database updated: ${event.data.id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.event_type}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Return 500 to trigger retry (if retriable error)
    if (error.retriable) {
      return res.status(500).json({ error: 'Temporary processing error' });
    }
    
    // Return 200 for non-retriable errors to avoid infinite retries
    res.status(200).json({ error: 'Non-retriable error' });
  }
});

// Health check endpoint
app.get('/webhook/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
```

### Python (Flask) handler

```python
# webhook_handler.py
import hashlib
import hmac
import json
import os
from flask import Flask, request, jsonify
from notion_handlers import process_page_update, process_page_creation

app = Flask(__name__)

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature for security."""
    if not signature or not secret:
        return False
    
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    expected_signature_header = f"sha256={expected_signature}"
    
    return hmac.compare_digest(signature, expected_signature_header)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    try:
        signature = request.headers.get('X-Notion-Signature')
        webhook_secret = os.getenv('NOTION_WEBHOOK_SECRET')
        
        # Verify signature (recommended for production)
        if webhook_secret and not verify_webhook_signature(
            request.get_data(), signature, webhook_secret
        ):
            app.logger.error('Invalid webhook signature')
            return jsonify({'error': 'Invalid signature'}), 401
        
        event = request.get_json()
        
        if not event:
            return jsonify({'error': 'Invalid JSON payload'}), 400
        
        app.logger.info(f"Received webhook: {event.get('event_type')}")
        
        # Handle different event types
        event_type = event.get('event_type')
        event_data = event.get('data', {})
        
        if event_type == 'page.created':
            process_page_creation(event_data)
            
        elif event_type == 'page.updated':
            process_page_update(event_data)
            
        elif event_type == 'page.deleted':
            app.logger.info(f"Page deleted: {event_data.get('id')}")
            
        elif event_type == 'database.updated':
            app.logger.info(f"Database updated: {event_data.get('id')}")
            
        else:
            app.logger.info(f"Unhandled event type: {event_type}")
        
        # Always respond with 200 to acknowledge receipt
        return jsonify({'success': True}), 200
        
    except Exception as error:
        app.logger.error(f"Webhook processing error: {error}")
        
        # Return 500 for retriable errors to trigger retry
        if hasattr(error, 'retriable') and error.retriable:
            return jsonify({'error': 'Temporary processing error'}), 500
        
        # Return 200 for non-retriable errors to avoid infinite retries
        return jsonify({'error': 'Non-retriable error'}), 200

@app.route('/webhook/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.utcnow().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Webhook endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

## Event processing examples

### Processing page updates

**JavaScript:**
```js
// notion-handlers.js
export async function processPageUpdate(pageData) {
  console.log(`📝 Page updated: ${pageData.id}`);
  
  // Extract useful information
  const pageTitle = getPageTitle(pageData);
  const lastEditedTime = pageData.last_edited_time;
  const lastEditedBy = pageData.last_edited_by?.id;
  
  // Example: Send notification to team
  await sendSlackNotification({
    text: `📝 Page "${pageTitle}" was updated`,
    timestamp: lastEditedTime,
    user: lastEditedBy
  });
  
  // Example: Update search index
  await updateSearchIndex({
    pageId: pageData.id,
    title: pageTitle,
    content: await extractPageContent(pageData.id),
    lastModified: lastEditedTime
  });
}

export async function processPageCreation(pageData) {
  console.log(`✨ New page created: ${pageData.id}`);
  
  const pageTitle = getPageTitle(pageData);
  
  // Example: Auto-assign page based on properties
  if (pageData.parent?.type === 'database_id') {
    await autoAssignPage(pageData);
  }
  
  // Example: Send welcome comment for new team members
  if (pageTitle.includes('Welcome')) {
    await addWelcomeComment(pageData.id);
  }
}

function getPageTitle(pageData) {
  const titleProperty = Object.values(pageData.properties || {})
    .find(prop => prop.type === 'title');
  
  return titleProperty?.title?.[0]?.text?.content || 'Untitled';
}
```

**Python:**
```python
# notion_handlers.py
import asyncio
from datetime import datetime
from typing import Dict, Any

def process_page_update(page_data: Dict[str, Any]):
    """Process page update events."""
    page_id = page_data.get('id')
    print(f"📝 Page updated: {page_id}")
    
    # Extract useful information
    page_title = get_page_title(page_data)
    last_edited_time = page_data.get('last_edited_time')
    last_edited_by = page_data.get('last_edited_by', {}).get('id')
    
    # Example: Log page changes
    log_page_change({
        'page_id': page_id,
        'title': page_title,
        'action': 'updated',
        'timestamp': last_edited_time,
        'user_id': last_edited_by
    })
    
    # Example: Trigger dependent workflows
    if should_trigger_workflow(page_data):
        trigger_workflow(page_id, 'page_updated')

def process_page_creation(page_data: Dict[str, Any]):
    """Process page creation events."""
    page_id = page_data.get('id')
    print(f"✨ New page created: {page_id}")
    
    page_title = get_page_title(page_data)
    
    # Example: Auto-categorize new pages
    if page_data.get('parent', {}).get('type') == 'database_id':
        auto_categorize_page(page_data)
    
    # Example: Send notifications for important pages
    if is_important_page(page_data):
        send_team_notification(page_id, page_title)

def get_page_title(page_data: Dict[str, Any]) -> str:
    """Extract page title from page properties."""
    properties = page_data.get('properties', {})
    
    for prop in properties.values():
        if prop.get('type') == 'title':
            title_array = prop.get('title', [])
            if title_array:
                return title_array[0].get('text', {}).get('content', 'Untitled')
    
    return 'Untitled'
```

## Retry handling and idempotency

### Implementing idempotency

```js
// idempotency-handler.js
const processedEvents = new Set(); // In production, use Redis or database

export async function handleEventIdempotently(event, processor) {
  const eventId = event.id;
  
  // Check if we've already processed this event
  if (processedEvents.has(eventId)) {
    console.log(`⏭️ Event ${eventId} already processed, skipping`);
    return { success: true, skipped: true };
  }
  
  try {
    // Process the event
    const result = await processor(event);
    
    // Mark as processed only after successful completion
    processedEvents.add(eventId);
    
    console.log(`✅ Event ${eventId} processed successfully`);
    return { success: true, result };
    
  } catch (error) {
    console.error(`❌ Error processing event ${eventId}:`, error);
    
    // Don't mark as processed if there was an error
    throw error;
  }
}
```

### Retry with exponential backoff

```python
# retry_handler.py
import time
import random
from typing import Callable, Any
from functools import wraps

def with_retries(max_retries: int = 3, base_delay: float = 1.0):
    """Decorator for retrying webhook processing with exponential backoff."""
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as error:
                    last_error = error
                    
                    # Don't retry on non-retriable errors
                    if hasattr(error, 'retriable') and not error.retriable:
                        raise
                    
                    if attempt < max_retries:
                        # Exponential backoff with jitter
                        delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                        time.sleep(min(delay, 30))  # Cap at 30 seconds
                        continue
                    
                    # All retries exhausted
                    break
            
            raise last_error
        return wrapper
    return decorator

# Usage example
@with_retries(max_retries=3)
def process_webhook_event(event_data):
    # Your event processing logic here
    pass
```

## Security best practices

### Webhook signature verification

Always verify webhook signatures in production:

```js
// Security headers to check
const requiredHeaders = [
  'X-Notion-Signature',
  'User-Agent' // Should contain 'Notion'
];

function validateWebhookRequest(req) {
  // Check required headers
  for (const header of requiredHeaders) {
    if (!req.get(header)) {
      throw new Error(`Missing required header: ${header}`);
    }
  }
  
  // Verify User-Agent
  const userAgent = req.get('User-Agent');
  if (!userAgent.includes('Notion')) {
    throw new Error('Invalid User-Agent');
  }
  
  return true;
}
```

### Rate limiting webhook endpoints

```js
// rate-limiter.js
import rateLimit from 'express-rate-limit';

export const webhookLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // Limit each IP to 10 requests per second
  message: {
    error: 'Too many webhook requests'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count successful requests
  skip: (req, res) => res.statusCode < 400
});

// Apply to webhook route
app.use('/webhook', webhookLimiter);
```

## Testing webhooks locally

### Using ngrok for local development

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)

2. Start your local webhook server:
```bash
npm start  # or python webhook_handler.py
```

3. Expose your local server:
```bash
ngrok http 3000
```

4. Use the ngrok HTTPS URL in your Notion integration webhook settings

### Webhook testing with curl

```bash
# Test your webhook endpoint
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Notion-Signature: sha256=test-signature" \
  -d '{
    "object": "event",
    "id": "test-event-id",
    "created_time": "2022-02-15T22:34:54.046Z",
    "event_type": "page.updated",
    "data": {
      "object": "page",
      "id": "test-page-id"
    }
  }'
```

## Error handling and monitoring

### Comprehensive error handling

```js
// webhook-errors.js
export class WebhookError extends Error {
  constructor(message, retriable = false, statusCode = 500) {
    super(message);
    this.name = 'WebhookError';
    this.retriable = retriable;
    this.statusCode = statusCode;
  }
}

export function handleWebhookError(error, req, res) {
  console.error('Webhook error:', {
    error: error.message,
    eventType: req.body?.event_type,
    eventId: req.body?.id,
    stack: error.stack
  });
  
  // Log to monitoring service (e.g., Sentry, DataDog)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        component: 'webhook',
        eventType: req.body?.event_type
      }
    });
  }
  
  // Return appropriate status code
  const statusCode = error.retriable ? 500 : 200;
  res.status(statusCode).json({
    error: error.message,
    retriable: error.retriable
  });
}
```

### Health monitoring

```js
// webhook-health.js
export class WebhookHealth {
  constructor() {
    this.stats = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      lastEventTime: null,
      uptime: Date.now()
    };
  }
  
  recordEvent(success = true) {
    this.stats.totalEvents++;
    this.stats.lastEventTime = new Date();
    
    if (success) {
      this.stats.successfulEvents++;
    } else {
      this.stats.failedEvents++;
    }
  }
  
  getHealthStatus() {
    const successRate = this.stats.totalEvents > 0 
      ? (this.stats.successfulEvents / this.stats.totalEvents) * 100 
      : 100;
      
    return {
      status: successRate > 95 ? 'healthy' : 'degraded',
      stats: {
        ...this.stats,
        successRate: `${successRate.toFixed(2)}%`,
        uptimeMinutes: Math.floor((Date.now() - this.stats.uptime) / 60000)
      }
    };
  }
}

const health = new WebhookHealth();

export { health };
```

## Deployment considerations

### Environment variables

```bash
# Required webhook configuration
NOTION_WEBHOOK_SECRET=your_webhook_secret_here
PORT=3000

# Optional monitoring and logging
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
NODE_ENV=production

# Database for idempotency (if using)
REDIS_URL=your_redis_url_here
DATABASE_URL=your_database_url_here
```

### Docker deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/webhook/health || exit 1

CMD ["node", "webhook-handler.js"]
```

## Best practices summary

1. **Always verify signatures** in production environments
2. **Implement idempotency** to handle duplicate events safely  
3. **Use exponential backoff** for retry logic
4. **Monitor webhook health** and set up alerting
5. **Handle errors gracefully** and return appropriate HTTP status codes
6. **Log webhook events** for debugging and monitoring
7. **Secure your endpoints** with rate limiting and validation
8. **Test locally** with ngrok before deploying

## Next steps

- Review [Error Handling](/errors) for robust webhook error management
- Explore [Sample Apps](/examples) with webhook implementations
- Set up monitoring and alerting for your webhook endpoints
- Implement webhook event processing for your specific use cases
