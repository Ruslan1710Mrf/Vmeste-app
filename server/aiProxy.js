const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { AI_SYSTEM_PROMPT } = require('../lib/aiSystemPrompt');

const PORT = Number(process.env.PORT ?? process.env.AI_PROXY_PORT ?? 3001);
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separator = trimmed.indexOf('=');
    if (separator === -1) return;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  });
}

loadEnvLocal();

function getAnthropicApiKey() {
  return (
    process.env.ANTHROPIC_API_KEY ??
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ??
    ''
  );
}

const app = express();

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai-chat', async (req, res) => {
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    return;
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    res.status(500).json({ error: 'Не задан API-ключ Anthropic. Добавьте ANTHROPIC_API_KEY в .env.local' });
    return;
  }

  const messages = req.body?.messages ?? [];
  if (!messages.length) {
    res.status(400).json({ error: 'Пустая история сообщений.' });
    return;
  }

  try {
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: AI_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text().catch(() => '');
      res.status(anthropicResponse.status).json({
        error: errorBody || `Claude API error: ${anthropicResponse.status}`,
      });
      return;
    }

    const data = await anthropicResponse.json();
    const text = data.content?.find((block) => block.type === 'text')?.text?.trim();

    if (!text) {
      res.status(500).json({ error: 'Пустой ответ от Claude API.' });
      return;
    }

    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy listening on http://localhost:${PORT}`);
});
