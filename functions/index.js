const functions = require("firebase-functions/v1");
const {getFirestore} = require("firebase-admin/firestore");
const {initializeApp} = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();

// Серверная модерация (вторая линия после фильтра в приложении).
Object.assign(exports, require("./moderation"));

const MODERATION_EMAIL = "ruslan@vmestegroup.app";

/**
 * Escapes HTML special characters in untrusted report fields.
 * @param {*} value Raw value to escape.
 * @return {string} Text safe to interpolate into an HTML email body.
 */
function escapeHtml(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

exports.notifyOnNewReport = functions.firestore
    .document("reports/{reportId}")
    .onCreate(async (snap, context) => {
      const reportId = context.params.reportId;
      const report = snap.data() || {};

      // Set server-side so the client never controls it: a malicious app
      // build could otherwise create reports pre-marked as resolved.
      // Updating here cannot re-trigger onCreate, so there is no loop.
      try {
        await snap.ref.update({status: "new"});
      } catch (err) {
        logger.error("Failed to set report status", {
          reportId: reportId,
          error: err.message,
        });
      }

      const rows = [
        ["Тип", report.targetType],
        ["ID цели", report.targetId],
        ["От кого", report.reporterId],
        ["Причина", report.reason || "—"],
        ["Создана", report.createdAt],
        ["ID жалобы", reportId],
      ];

      const rowsHtml = rows.map((pair) => [
        "<tr>",
        "<td style=\"padding:6px 16px 6px 0;color:#64748B;\">",
        escapeHtml(pair[0]),
        "</td>",
        "<td style=\"padding:6px 0;font-weight:600;\">",
        escapeHtml(pair[1]),
        "</td>",
        "</tr>",
      ].join("")).join("");

      const consoleUrl = "https://console.firebase.google.com/project/" +
        "veste-app-bffb0/firestore/data/~2Freports~2F" + reportId;

      const html = [
        "<div style=\"font-family:sans-serif;max-width:520px;\">",
        "<h2 style=\"margin-bottom:8px;\">Новая жалоба в Vmeste</h2>",
        "<table style=\"border-collapse:collapse;font-size:14px;\">",
        rowsHtml,
        "</table>",
        "<p style=\"margin-top:20px;\">",
        "<a href=\"" + consoleUrl + "\">Открыть в Firebase Console</a>",
        "</p>",
        "<p style=\"color:#64748B;font-size:13px;margin-top:20px;\">",
        "Разобрав жалобу, смените поле status на resolved.",
        "</p>",
        "</div>",
      ].join("");

      const subject = "Жалоба (" + (report.targetType || "?") + ") — " +
        reportId;

      try {
        await getFirestore().collection("mail").add({
          to: [MODERATION_EMAIL],
          message: {
            subject: subject,
            html: html,
          },
        });
        logger.info("Report notification queued", {reportId: reportId});
      } catch (err) {
        logger.error("Failed to queue report notification", {
          reportId: reportId,
          error: err.message,
        });
      }
    });

// ---------------------------------------------------------------------------
// AI-помощник. Перенесён с Railway (server/aiProxy.js) после утечки env на
// Railway 21.10.2026: ключ Anthropic теперь в Secret Manager, ключ сервисного
// аккаунта не нужен (verifyIdToken работает на штатных правах функции).
// ---------------------------------------------------------------------------
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const {getAuth} = require("firebase-admin/auth");

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const AI_MODEL = "claude-sonnet-4-6";
const AI_SYSTEM_PROMPT =
  "Ты универсальный помощник. Отвечай чётко и по делу на языке " +
  "пользователя. Помогай с любыми вопросами без ограничений.";
const AI_RATE_LIMIT_MAX = 20;
const AI_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const AI_HISTORY_LIMIT = 20;
const AI_MESSAGE_MAX_CHARS = 4000;
const AI_ALLOWED_ORIGINS = [
  "https://veste-app-bffb0.web.app",
  "https://veste-app-bffb0.firebaseapp.com",
  "http://localhost:8081",
  "http://localhost:19006",
];
// Лимит в памяти — на один экземпляр функции; при maxInstances 5 это
// по-прежнему грубая защита от одного пользователя, жгущего ключ.
const aiRateLimitStore = new Map();

/**
 * Counts a request for the user and says whether the hourly limit is hit.
 * @param {string} uid Firebase user id.
 * @return {boolean} True when the user exceeded the limit.
 */
function isAiRateLimited(uid) {
  const now = Date.now();
  const entry = aiRateLimitStore.get(uid);
  if (!entry || now - entry.windowStart >= AI_RATE_LIMIT_WINDOW_MS) {
    aiRateLimitStore.set(uid, {count: 1, windowStart: now});
    return false;
  }
  if (entry.count >= AI_RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

exports.aiChat = onRequest(
    {
      region: "us-central1",
      secrets: [ANTHROPIC_API_KEY],
      maxInstances: 5,
      timeoutSeconds: 120,
      memory: "256MiB",
    },
    async (req, res) => {
      const origin = req.get("origin");
      // Нативное приложение не шлёт Origin — пропускаем.
      if (origin) {
        if (!AI_ALLOWED_ORIGINS.includes(origin)) {
          res.status(403).json({error: "Origin не разрешён."});
          return;
        }
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Vary", "Origin");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }
      if (req.method === "GET" && req.path.endsWith("/health")) {
        res.json({ok: true});
        return;
      }
      if (req.method !== "POST") {
        res.status(405).json({error: "Метод не поддерживается."});
        return;
      }

      const authHeader = req.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ?
        authHeader.slice(7) : null;
      if (!token) {
        res.status(401).json({error: "Необходима авторизация."});
        return;
      }
      let uid;
      try {
        uid = (await getAuth().verifyIdToken(token)).uid;
      } catch (e) {
        res.status(401).json({error: "Недействительный токен авторизации."});
        return;
      }

      if (isAiRateLimited(uid)) {
        res.status(429).json(
            {error: "Превышен лимит запросов. Попробуйте позже."});
        return;
      }

      const raw = Array.isArray(req.body && req.body.messages) ?
        req.body.messages : [];
      const valid = raw
          .filter((m) => m && (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string")
          .map((m) => ({
            role: m.role,
            content: m.content.slice(0, AI_MESSAGE_MAX_CHARS),
          }))
          .slice(-AI_HISTORY_LIMIT);
      const firstUser = valid.findIndex((m) => m.role === "user");
      const messages = firstUser === -1 ? [] : valid.slice(firstUser);
      if (!messages.length) {
        res.status(400).json({error: "Пустая история сообщений."});
        return;
      }

      try {
        const response = await fetch(ANTHROPIC_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY.value(),
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: AI_MODEL,
            max_tokens: 1024,
            system: AI_SYSTEM_PROMPT,
            messages,
          }),
        });
        if (!response.ok) {
          const body = await response.text().catch(() => "");
          logger.error("Claude API error", {status: response.status, body});
          res.status(502).json({error: "AI временно недоступен."});
          return;
        }
        const data = await response.json();
        const block = (data.content || []).find((b) => b.type === "text");
        const text = block && block.text ? block.text.trim() : "";
        if (!text) {
          res.status(502).json({error: "Пустой ответ от AI."});
          return;
        }
        res.json({text});
      } catch (err) {
        logger.error("aiChat failed", {error: err.message});
        res.status(500).json({error: "Внутренняя ошибка сервера."});
      }
    },
);
