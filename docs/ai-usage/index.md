# Responsible AI usage

Practical guidelines for integrating AI features while protecting users, complying with platform policies, and keeping systems resilient.

## Scope
- Applies to any feature that calls AI models (e.g., OpenAI) for generation, classification, or summarization, and any Slack app surfaces (messages, modals, files).  
- Focus areas: data minimization, consent and transparency, redaction and logging, content safety, rate limiting, and incident response.  

## Safety objectives
- Prevent unsafe prompts/outputs from reaching users or external services.  
- Minimize exposure of personal and sensitive data in prompts, logs, and telemetry.  
- Provide predictable fallbacks (graceful degradation) and human escalation paths.  

## Data minimization and redaction
- Send only the minimum fields needed to solve the task; prefer IDs and short snippets over full records.  
- Redact PII before prompts, transport, and logging (names, emails, phone, addresses, access tokens, secrets).  
- Store prompts/outputs only when necessary; set explicit retention windows and access controls.

```js
// node: minimal redaction middleware example
const REDACT_PATTERNS = [
  { name: 'EMAIL', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { name: 'PHONE', regex: /\+?\d[\d\s().-]{8,}\b/g },
  { name: 'TOKEN', regex: /(sk|xoxb|xoxp|xapp|xoxe)[a-zA-Z0-9-]{20,}/g },
];

export function redact(input) {
  let out = input ?? '';
  for (const { regex } of REDACT_PATTERNS) out = out.replace(regex, '[REDACTED]');
  return out;
}
```

## Prompt safety patterns
- Use a strict system prompt with scope, allowed tools, and refusal rules; prefer tool/function calls over free‑form text.  
- Bound inputs with schemas and length caps; reject or trim overly long inputs before calling the model.  
- Insert organization policy snippets (what’s allowed/disallowed) into the system message for consistent behavior.

```js
const system = [
  "You are an assistant for workspace knowledge tasks.",
  "Follow safety rules: do not reveal secrets, credentials, or private data.",
  "If content is violent, sexual (including minors), hateful, or requests PII, refuse with a short, neutral message.",
].join('\n');

const user = redact(inputText).slice(0, 4000); // cap input length
```

## Output controls and moderation
- Classify user input and model output with a moderation step; block or route to review when unsafe.  
- On block, return a short, neutral message and optional appeal/escalation link.  
- Log category only (not raw content) for metrics; avoid storing unsafe text.

```js
async function moderatedCall({ prompt, call }) {
  const safeIn = await moderate(prompt);       // classify input
  if (!safeIn.allowed) return { blocked: true, reason: safeIn.category };

  const result = await call();                 // model call
  const safeOut = await moderate(result.text); // classify output
  if (!safeOut.allowed) return { blocked: true, reason: safeOut.category };

  return { blocked: false, text: result.text };
}
```

## Slack-specific safeguards
- Verify Slack request signatures, enforce least‑privilege scopes, and never echo raw user content without checks.  
- Use ephemeral responses for unreviewed or uncertain AI results; switch to channel messages only after passing moderation.  
- Avoid posting unsafe links/files; sanitize unfurls and strip tokens from any echoed content.

```js
// Slack signature verification (Express)
import crypto from 'crypto';
function verifySlack(req, signingSecret) {
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  const body = req.rawBody; // ensure raw body available
  const base = `v0:${ts}:${body}`;
  const hmac = 'v0=' + crypto.createHmac('sha256', signingSecret).update(base).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig));
}
```

## Rate limiting, retries, and cost controls
- Apply client‑side rate limits and exponential backoff on 429/5xx; cap maximum retries and use idempotency keys for webhook-driven tasks.  
- Set per‑feature and per‑workspace quotas; include circuit breakers to disable AI features on repeated failures.  
- Track token/compute budgets; sample logs instead of storing all prompts/outputs.

```js
async function withRetry(fn, { attempts = 5 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const res = await fn();
    if (res.ok || ![429, 500, 502, 503, 504].includes(res.status)) return res;
    await new Promise(r => setTimeout(r, Math.min(2 ** i * 250, 8000)));
  }
  throw new Error('max retries exceeded');
}
```

## UX for blocked content
- Use friendly, action‑oriented copy: “This request can’t be completed due to safety policies. Try removing personal data or sensitive topics.”  
- Offer alternatives: summarization without sensitive parts, links to internal policy pages, or a “request human help” action.  
- Never leak policy internals or model/system prompts in error messages.

## Logging, privacy, and governance
- Log only metadata and hashes for correlation (request_id, categories, latency), not raw content; use structured logs.  
- Restrict who can view prompts/outputs; set per‑environment retention (e.g., dev: 7 days, prod: 30 days) and purge jobs.  
- Document DSR (data subject request) handling: locate and delete user data, including prompts/outputs and Slack artifacts.

## Evaluations and testing
- Maintain a small eval set covering benign, borderline, and disallowed content; gate changes on these checks.  
- Add regression tests for redaction, refusal patterns, and Slack signature verification; include canary alarms on spike in blocks.  
- Record false positives/negatives and adjust prompts, model settings, or rules with sign‑off.

## Configuration checklist
- ENV: OPENAI_API_KEY, OPENAI_ORG (if used), MODERATION_ENABLED=true, REDACTION_ENABLED=true, SAFETY_MODE=strict|standard.  
- Slack: SLACK_SIGNING_SECRET, bot token, minimal scopes, and feature flags for ephemeral vs. channel posting.  
- Observability: REQUEST_TIMEOUT, MAX_RETRIES, RATE_LIMITS, LOG_LEVEL, RETENTION_DAYS.

## Transparency and consent
- Inform users when AI features are used, what data is processed, and how to opt out; add a “Why was this blocked?” link.  
- Provide a human escalation path and a way to report harmful outputs.  
- Document data flows (prompt → provider → output) and third parties involved.

## Incident response
- Define severity levels and playbooks for unsafe output in Slack or external channels; revoke tokens if needed.  
- Capture the minimal evidence required, notify stakeholders, and add temporary guardrails until a fix ships.  
- Post‑mortem with action items on prompts, filters, or product UX.

## Quickstart: Minimal safety pipeline

```js
// safety-pipeline.js
import { redact } from './redact.js';
import { moderate } from './moderation.js';

const MAX_INPUT = 5000;

export async function safeGenerate({ input, generate }) {
  const sanitized = redact(String(input)).slice(0, MAX_INPUT);

  const inCheck = await moderate(sanitized);
  if (!inCheck.allowed) {
    return { blocked: true, where: 'input', reason: inCheck.category };
  }

  const result = await generate(sanitized); // your model call
  const outCheck = await moderate(result.text || '');
  if (!outCheck.allowed) {
    return { blocked: true, where: 'output', reason: outCheck.category };
  }

  return { blocked: false, text: result.text };
}
```

### .env example

```bash
# AI provider
OPENAI_API_KEY=your_openai_key
MODERATION_ENABLED=true
REDACTION_ENABLED=true
SAFETY_MODE=strict

# Slack
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-...
```

## OpenAI moderation integration

### JavaScript (Node)

```js
// moderation.js
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function moderate(text) {
  if (process.env.MODERATION_ENABLED === 'false') {
    return { allowed: true, category: 'disabled' };
  }

  const resp = await client.moderations.create({
    model: 'omni-moderation-latest',
    input: String(text).slice(0, 5000)
  });

  const r = resp.results?.[0];
  const allowed = r ? !r.flagged : true;
  const categories = r ? Object.entries(r.categories).filter(([, v]) => v).map(([k]) => k) : [];
  return { allowed, category: categories.join(', ') || 'none' };
}
```

### Python

```python
# moderation.py
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def moderate(text: str) -> dict:
    if os.getenv('MODERATION_ENABLED', 'true').lower() == 'false':
        return { 'allowed': True, 'category': 'disabled' }

    resp = client.moderations.create(
        model='omni-moderation-latest',
        input=(text or '')[:5000]
    )
    r = resp.results[0]
    allowed = not r.flagged
    categories = [k for k, v in r.categories.items() if v]
    return { 'allowed': allowed, 'category': ', '.join(categories) or 'none' }
```

## Slack gating (ephemeral → channel)

```js
// slack-gating.js
import { App } from '@slack/bolt';
import { moderate } from './moderation.js';
import { redact } from './redact.js';

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app.command('/ask', async ({ command, ack, respond }) => {
  await ack();

  const userText = command.text || '';
  const redacted = redact(userText);
  const inMod = await moderate(redacted);
  if (!inMod.allowed) {
    return respond({ response_type: 'ephemeral', text: `⚠️ Blocked by policy: ${inMod.category}` });
  }

  // Generate (pseudo)
  const answer = `You asked: ${redacted}`;

  const outMod = await moderate(answer);
  if (!outMod.allowed) {
    return respond({ response_type: 'ephemeral', text: `⚠️ Output blocked: ${outMod.category}` });
  }

  return respond({ response_type: 'in_channel', text: answer });
});
```

## Policy mapping (example)

| Category | Action |
|---|---|
| `sexual/minors` | Block; escalate to human review |
| `hate` / `harassment` | Block; log category only |
| `violence/graphic` | Block |
| `self-harm` | Block; show help resources |
| `pii` (emails, phones, secrets) | Redact; require explicit consent for processing |
| `malware/instructions` | Block |
| `copyright` | Summarize; avoid verbatim reproduction |

## References

- OpenAI safety and usage: [OpenAI policies](https://openai.com/policies)
- Slack app security: [Slack API security](https://api.slack.com/authentication/verifying-requests-from-slack)
