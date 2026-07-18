const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { AI_SYSTEM_PROMPT } = require('../lib/aiSystemPrompt');

const PORT = Number(process.env.PORT ?? process.env.AI_PROXY_PORT ?? 3001);
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map();

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

// Firebase Admin — инициализируется через env vars, заданные на Railway
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // В dev без переменных — Firebase Admin не инициализирован,
    // middleware пропустит проверку токена (see verifyToken below)
    console.warn('[aiProxy] Firebase Admin credentials not set — auth check disabled');
  }
}

function isRateLimited(uid) {
  const now = Date.now();
  const entry = rateLimitStore.get(uid);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(uid, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function getAnthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY ?? '';
}

const IS_DEV = process.env.NODE_ENV === 'development';

async function verifyToken(req, res, next) {
  if (!admin.apps.length) {
    if (IS_DEV) {
      req.uid = 'dev-anonymous';
      return next();
    }
    // На проде отсутствие credentials — ошибка конфигурации сервера, не клиента
    return res.status(500).json({ error: 'Сервер не настроен: отсутствуют Firebase credentials.' });
  }

  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Необходима авторизация.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен авторизации.' });
  }
}

const ALLOWED_ORIGINS = [
  'https://veste-app-bffb0.web.app',
  'https://veste-app-bffb0.firebaseapp.com',
  'http://localhost:8081',
  'http://localhost:19006',
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Нативный app не шлёт Origin — пропускаем
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} не разрешён`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai-chat', verifyToken, async (req, res) => {
  if (isRateLimited(req.uid)) {
    res.status(429).json({ error: 'Превышен лимит запросов. Попробуйте позже.' });
    return;
  }

  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    res.status(500).json({ error: 'Не задан ANTHROPIC_API_KEY на сервере.' });
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
