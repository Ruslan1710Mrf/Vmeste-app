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
const {AI_SYSTEM_PROMPT} = require("./aiSystemPrompt");
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

// ---------------------------------------------------------------------------
// Push-уведомления (Expo Push API).
// Токены устройств: users/{uid}/private/push → {tokens: [...], enabled}.
// Лента в приложении: users/{uid}/notifications/{id} (пишет только сервер).
// ---------------------------------------------------------------------------
const {FieldValue} = require("firebase-admin/firestore");
const {containsObjectionableContent} = require("./contentFilter");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const PUSH_BODY_MAX_CHARS = 120;
// Серия сообщений в одном чате — один пуш в минуту, а не на каждое.
const MESSAGE_PUSH_COOLDOWN_MS = 60 * 1000;

/**
 * Shortens text for a push body and hides objectionable content.
 * @param {*} text Raw user text.
 * @param {string} fallback Text to show when the original must be hidden.
 * @return {string} Safe preview.
 */
function pushPreview(text, fallback) {
  const value = typeof text === "string" ? text.trim() : "";
  if (!value || containsObjectionableContent(value)) return fallback;
  if (value.length <= PUSH_BODY_MAX_CHARS) return value;
  return value.slice(0, PUSH_BODY_MAX_CHARS - 1) + "…";
}

/**
 * Says whether either user blocked the other.
 * @param {string} uidA First user id.
 * @param {string} uidB Second user id.
 * @return {Promise<boolean>} True when a block exists in any direction.
 */
async function isBlockedEitherWay(uidA, uidB) {
  const db = getFirestore();
  const [ab, ba] = await Promise.all([
    db.doc("blocks/" + uidA + "_" + uidB).get(),
    db.doc("blocks/" + uidB + "_" + uidA).get(),
  ]);
  return ab.exists || ba.exists;
}

/**
 * Sends one push to every device of the user and drops dead tokens.
 * @param {string} uid Recipient user id.
 * @param {{title: string, body: string, data: Object}} message Push content.
 * @param {string} [cooldownKey] Skip if this key was pushed recently.
 * @param {string} [prefKey] Per-type switch in the push doc (e.g. events).
 * @return {Promise<void>}
 */
async function sendPushToUser(uid, message, cooldownKey, prefKey) {
  const ref = getFirestore().doc("users/" + uid + "/private/push");
  const snap = await ref.get();
  const push = snap.exists ? snap.data() : null;
  const tokens = push && Array.isArray(push.tokens) ? push.tokens : [];
  if (tokens.length === 0 || push.enabled === false) return;
  if (prefKey && push[prefKey] === false) return;

  if (cooldownKey) {
    const last = push.cooldowns && push.cooldowns[cooldownKey];
    const lastMs = last && typeof last.toMillis === "function" ?
      last.toMillis() : 0;
    if (Date.now() - lastMs < MESSAGE_PUSH_COOLDOWN_MS) return;
    await ref.set({cooldowns: {[cooldownKey]: FieldValue.serverTimestamp()}},
        {merge: true});
  }

  const payload = tokens.map((token) => ({
    to: token,
    title: message.title,
    body: message.body,
    data: message.data,
    sound: "default",
    channelId: "default",
  }));

  let tickets = [];
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok) {
      logger.error("Expo push request failed", {uid: uid, status:
        response.status, errors: json.errors});
      return;
    }
    tickets = Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    logger.error("Expo push request threw", {uid: uid, error: err.message});
    return;
  }

  const deadTokens = tickets
      .map((ticket, index) => (ticket.status === "error" &&
        ticket.details && ticket.details.error === "DeviceNotRegistered") ?
        tokens[index] : null)
      .filter(Boolean);
  if (deadTokens.length > 0) {
    await ref.update({tokens: FieldValue.arrayRemove(...deadTokens)});
  }
  const otherErrors = tickets.filter((ticket) => ticket.status === "error" &&
    !(ticket.details && ticket.details.error === "DeviceNotRegistered"));
  if (otherErrors.length > 0) {
    logger.warn("Expo push tickets with errors", {uid: uid,
      errors: otherErrors.map((ticket) => ticket.message)});
  }
}

exports.pushOnNewMessage = functions.firestore
    .document("conversations/{convId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
      const convId = context.params.convId;
      const message = snap.data() || {};
      const fromUid = message.fromUid;
      if (!fromUid) return;
      // Сообщение с нарушением удалит moderateMessage — не уведомляем.
      if (containsObjectionableContent(message.text)) return;

      const convSnap = await getFirestore().doc("conversations/" + convId)
          .get();
      if (!convSnap.exists) return;
      const conv = convSnap.data() || {};
      const participants = Array.isArray(conv.participants) ?
        conv.participants : [];
      const toUid = participants.find((uid) => uid !== fromUid);
      if (!toUid) return;
      if (await isBlockedEitherWay(fromUid, toUid)) return;

      const names = conv.participantNames || {};
      const fromName = pushPreview(names[fromUid], "Vmeste");
      try {
        await sendPushToUser(toUid, {
          title: fromName,
          body: pushPreview(message.text, "Новое сообщение"),
          data: {type: "message", fromUid: fromUid, convId: convId},
        }, "conv_" + convId);
      } catch (err) {
        logger.error("pushOnNewMessage failed", {convId: convId,
          error: err.message});
      }
    });

exports.pushOnNewReply = functions.firestore
    .document("posts/{postId}")
    .onUpdate(async (change, context) => {
      const postId = context.params.postId;
      const before = change.before.data() || {};
      const after = change.after.data() || {};
      const oldReplies = Array.isArray(before.replies) ? before.replies : [];
      const newReplies = Array.isArray(after.replies) ? after.replies : [];
      // Лайки и правки поста тоже обновляют документ — реагируем только
      // на добавленные комментарии.
      if (newReplies.length <= oldReplies.length) return;

      const postAuthorId = after.authorId;
      if (!postAuthorId) return;
      const added = newReplies.slice(oldReplies.length)
          .filter((reply) => reply && reply.authorId &&
            reply.authorId !== postAuthorId &&
            // Такой комментарий вырежет moderatePost — не уведомляем.
            !containsObjectionableContent(reply.text) &&
            !containsObjectionableContent(reply.author));

      for (const reply of added) {
        try {
          if (await isBlockedEitherWay(reply.authorId, postAuthorId)) continue;
          const fromName = pushPreview(reply.author, "Участник");
          const body = pushPreview(reply.text, "Новый комментарий");
          await getFirestore()
              .collection("users/" + postAuthorId + "/notifications")
              .add({
                type: "comment",
                postId: postId,
                fromUid: reply.authorId,
                fromName: fromName,
                text: body,
                read: false,
                createdAt: FieldValue.serverTimestamp(),
              });
          await sendPushToUser(postAuthorId, {
            title: fromName + " прокомментировал(а) ваш пост",
            body: body,
            data: {type: "comment", postId: postId},
          });
        } catch (err) {
          logger.error("pushOnNewReply failed", {postId: postId,
            error: err.message});
        }
      }
    });

// ---------------------------------------------------------------------------
// События: участники и напоминания.
// Запись: events/{eventId}/attendees/{uid} (создаёт сам пользователь).
// Время начала: events/{eventId}.startsAt — есть, если приложение разобрало
// дату. Напоминания: за сутки и за час, флаги reminders.h24 / reminders.h1.
// ---------------------------------------------------------------------------
const HOUR_MS = 60 * 60 * 1000;

exports.countEventAttendees = functions.firestore
    .document("events/{eventId}/attendees/{uid}")
    .onWrite(async (change, context) => {
      const delta = !change.before.exists && change.after.exists ? 1 :
        change.before.exists && !change.after.exists ? -1 : 0;
      if (delta === 0) return;
      try {
        await getFirestore().doc("events/" + context.params.eventId)
            .update({attendees: FieldValue.increment(delta)});
      } catch (err) {
        // Событие уже удалено — считать нечего.
        logger.info("countEventAttendees skipped", {
          eventId: context.params.eventId, error: err.message});
      }
    });

exports.cleanupEventAttendees = functions.firestore
    .document("events/{eventId}")
    .onDelete(async (snap) => {
      try {
        await getFirestore().recursiveDelete(snap.ref.collection("attendees"));
      } catch (err) {
        logger.error("cleanupEventAttendees failed", {path: snap.ref.path,
          error: err.message});
      }
    });

/**
 * Human-readable "time left" for a reminder body.
 * @param {number} msLeft Milliseconds until the start.
 * @return {string} Text like "через 3 ч" or "через 40 мин".
 */
function timeLeftText(msLeft) {
  if (msLeft >= 90 * 60 * 1000) {
    return "через " + Math.round(msLeft / HOUR_MS) + " ч";
  }
  return "через " + Math.max(1, Math.round(msLeft / 60000)) + " мин";
}

exports.sendEventReminders = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async () => {
      const db = getFirestore();
      const now = Date.now();
      const snap = await db.collection("events")
          .where("startsAt", ">", new Date(now))
          .where("startsAt", "<=", new Date(now + 24 * HOUR_MS))
          .get();

      for (const eventDoc of snap.docs) {
        const event = eventDoc.data() || {};
        const reminders = event.reminders || {};
        const msLeft = event.startsAt.toMillis() - now;
        const stage = msLeft <= HOUR_MS ?
          (reminders.h1 ? null : "h1") :
          (reminders.h24 ? null : "h24");
        if (!stage) continue;

        try {
          // Флаги ставим до рассылки: лучше пропустить напоминание при
          // сбое, чем прислать его дважды.
          const flags = {"reminders.h1": stage === "h1" || !!reminders.h1,
            "reminders.h24": true};
          await eventDoc.ref.update(flags);

          const attendees = await eventDoc.ref.collection("attendees").get();
          const title = pushPreview(event.title, "Событие");
          const venue = pushPreview(event.venue, "");
          const body = "Начало " + timeLeftText(msLeft) +
            (venue ? " · " + venue : "");
          for (const attendee of attendees.docs) {
            const uid = attendee.id;
            if (event.authorId && uid !== event.authorId &&
              await isBlockedEitherWay(uid, event.authorId)) continue;
            await sendPushToUser(uid, {
              title: "Напоминание: " + title,
              body: body,
              data: {type: "event", eventId: eventDoc.id},
            }, null, "events");
          }
          logger.info("Event reminders sent", {eventId: eventDoc.id,
            stage: stage, attendees: attendees.size});
        } catch (err) {
          logger.error("sendEventReminders failed", {eventId: eventDoc.id,
            error: err.message});
        }
      }
    });
