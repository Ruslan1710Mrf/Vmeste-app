const functions = require("firebase-functions/v1");
const {getFirestore} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

const MODERATION_EMAIL = "ruslan@vmestegroup.app";

/**
 * Escapes HTML special characters.
 * @param {*} value Raw value.
 * @return {string} Text safe for an HTML email body.
 */
function escapeHtml(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Серверная модерация. Приложение уже не даёт отправить мат, но изменённый
// клиент может писать в Firestore напрямую. Эти триггеры — вторая линия:
// новый документ с нарушением удаляется, правка откатывается к прошлой
// версии, нарушивший комментарий вырезается. Каждый случай — запись в
// moderationLog (клиенту закрыто правилами) и письмо модератору.
// Повторный запуск триггера после нашей же правки ничего не делает:
// документ уже чистый.
// ---------------------------------------------------------------------------
const {containsObjectionableContent: isObjectionable} =
  require("./contentFilter");
const modFieldValue = require("firebase-admin/firestore").FieldValue;

const POST_FIELDS = ["content", "author"];
const EVENT_FIELDS = ["title", "description", "venue", "host", "city",
  "agenda"];
const USER_FIELDS = ["name", "city"];
const DEFAULT_USER_NAME = "Пользователь";

/**
 * Checks a string or an array of strings with the content filter.
 * @param {*} value Field value.
 * @return {boolean} True when the value is objectionable.
 */
function valueIsObjectionable(value) {
  if (typeof value === "string") return isObjectionable(value);
  if (Array.isArray(value)) {
    return value.some((item) => typeof item === "string" &&
      isObjectionable(item));
  }
  return false;
}

/**
 * Lists the fields of a document that fail the content filter.
 * @param {Object} data Document data.
 * @param {string[]} fields Field names to check.
 * @return {string[]} Names of objectionable fields.
 */
function badFields(data, fields) {
  return fields.filter((field) => valueIsObjectionable(data[field]));
}

/**
 * Records a moderation action and emails the moderator.
 * @param {Object} entry What was found and what was done.
 * @return {Promise<void>}
 */
async function logModeration(entry) {
  const db = getFirestore();
  const record = Object.assign({}, entry,
      {createdAt: modFieldValue.serverTimestamp()});
  try {
    const ref = await db.collection("moderationLog").add(record);
    const consoleUrl = "https://console.firebase.google.com/project/" +
      "veste-app-bffb0/firestore/data/~2FmoderationLog~2F" + ref.id;
    const rows = [
      ["Где", entry.path],
      ["Поля", (entry.fields || []).join(", ")],
      ["Действие", entry.action],
      ["Пользователь", entry.uid || "—"],
    ].map((pair) => "<tr><td style=\"padding:4px 16px 4px 0;" +
      "color:#64748B;\">" + escapeHtml(pair[0]) + "</td><td style=\"" +
      "padding:4px 0;font-weight:600;\">" + escapeHtml(pair[1]) +
      "</td></tr>").join("");
    await db.collection("mail").add({
      to: [MODERATION_EMAIL],
      message: {
        subject: "Автомодерация: " + entry.action + " — " + entry.path,
        html: "<div style=\"font-family:sans-serif;max-width:520px;\">" +
          "<h2>Сервер заблокировал контент в обход приложения</h2>" +
          "<table style=\"border-collapse:collapse;font-size:14px;\">" +
          rows + "</table><p>Такое возможно только из изменённого " +
          "клиента — стоит проверить пользователя и при повторе " +
          "отключить аккаунт (Authentication → Disable).</p>" +
          "<p><a href=\"" + consoleUrl + "\">Запись в moderationLog</a>" +
          "</p></div>",
      },
    });
  } catch (err) {
    logger.error("logModeration failed", {path: entry.path,
      error: err.message});
  }
}

/**
 * Shared logic for posts and events: delete a new bad document, roll back
 * a bad edit to the previous clean values.
 * @param {Object} change Firestore change (before/after snapshots).
 * @param {string[]} fields Fields to check.
 * @param {Object} [extraUpdate] Extra fields to write in the same update.
 * @return {Promise<{handled: boolean, found: string[]}>} What was done.
 */
async function moderateFields(change, fields, extraUpdate) {
  const after = change.after.data() || {};
  const before = change.before.exists ? change.before.data() || {} : null;
  const found = badFields(after, fields);
  const ref = change.after.ref;

  if (found.length === 0) {
    if (extraUpdate) await ref.update(extraUpdate);
    return {handled: Boolean(extraUpdate), found: found};
  }

  const canRevert = before && badFields(before, found).length === 0;
  if (!canRevert) {
    await ref.delete();
    await logModeration({path: ref.path, fields: found, action: "удалено",
      uid: after.authorId || null,
      sample: found.map((field) => String(after[field]).slice(0, 300))});
    return {handled: true, found: found};
  }

  const revert = Object.assign({}, extraUpdate || {});
  for (const field of found) {
    revert[field] = before[field] === undefined ?
      modFieldValue.delete() : before[field];
  }
  await ref.update(revert);
  await logModeration({path: ref.path, fields: found,
    action: "правка отменена", uid: after.authorId || null,
    sample: found.map((field) => String(after[field]).slice(0, 300))});
  return {handled: true, found: found};
}

exports.moderatePost = functions.firestore
    .document("posts/{postId}")
    .onWrite(async (change) => {
      if (!change.after.exists) return;
      const after = change.after.data() || {};
      const before = change.before.exists ? change.before.data() || {} : {};

      // Новые комментарии с нарушением вырезаем из массива replies.
      const oldIds = new Set((Array.isArray(before.replies) ?
        before.replies : []).map((reply) => reply && reply.id));
      const replies = Array.isArray(after.replies) ? after.replies : [];
      const badReplies = replies.filter((reply) => reply &&
        !oldIds.has(reply.id) &&
        (valueIsObjectionable(reply.text) ||
          valueIsObjectionable(reply.author)));
      const extraUpdate = badReplies.length === 0 ? null : {
        replies: replies.filter((reply) => !badReplies.includes(reply)),
      };

      try {
        await moderateFields(change, POST_FIELDS, extraUpdate);
        if (badReplies.length > 0) {
          await logModeration({path: change.after.ref.path,
            fields: ["replies"], action: "комментарий удалён",
            uid: badReplies.map((reply) => reply.authorId).join(", "),
            sample: badReplies.map((reply) =>
              String(reply.text).slice(0, 300))});
        }
      } catch (err) {
        logger.error("moderatePost failed", {path: change.after.ref.path,
          error: err.message});
      }
    });

exports.moderateEvent = functions.firestore
    .document("events/{eventId}")
    .onWrite(async (change) => {
      if (!change.after.exists) return;
      try {
        await moderateFields(change, EVENT_FIELDS);
      } catch (err) {
        logger.error("moderateEvent failed", {path: change.after.ref.path,
          error: err.message});
      }
    });

exports.moderateMessage = functions.firestore
    .document("conversations/{convId}/messages/{messageId}")
    .onCreate(async (snap, context) => {
      const message = snap.data() || {};
      if (!valueIsObjectionable(message.text)) return;
      try {
        await snap.ref.delete();
        const convRef = getFirestore()
            .doc("conversations/" + context.params.convId);
        const conv = await convRef.get();
        if (conv.exists && conv.data().lastMessage === message.text) {
          await convRef.update({lastMessage: ""});
        }
        await logModeration({path: snap.ref.path, fields: ["text"],
          action: "сообщение удалено", uid: message.fromUid || null,
          sample: [String(message.text).slice(0, 300)]});
      } catch (err) {
        logger.error("moderateMessage failed", {path: snap.ref.path,
          error: err.message});
      }
    });

exports.moderateConversation = functions.firestore
    .document("conversations/{convId}")
    .onWrite(async (change) => {
      if (!change.after.exists) return;
      const conv = change.after.data() || {};
      const update = {};
      const fields = [];
      if (valueIsObjectionable(conv.lastMessage)) {
        update.lastMessage = "";
        fields.push("lastMessage");
      }
      const names = conv.participantNames || {};
      for (const uid of Object.keys(names)) {
        if (valueIsObjectionable(names[uid])) {
          update["participantNames." + uid] = DEFAULT_USER_NAME;
          fields.push("participantNames." + uid);
        }
      }
      if (fields.length === 0) return;
      try {
        await change.after.ref.update(update);
        await logModeration({path: change.after.ref.path, fields: fields,
          action: "заменено", uid: null, sample: []});
      } catch (err) {
        logger.error("moderateConversation failed", {
          path: change.after.ref.path, error: err.message});
      }
    });

exports.moderateUser = functions.firestore
    .document("users/{userId}")
    .onWrite(async (change, context) => {
      if (!change.after.exists) return;
      const user = change.after.data() || {};
      const found = badFields(user, USER_FIELDS);
      if (found.length === 0) return;
      const update = {};
      for (const field of found) {
        update[field] = field === "name" ? DEFAULT_USER_NAME : "";
      }
      try {
        await change.after.ref.update(update);
        await logModeration({path: change.after.ref.path, fields: found,
          action: "заменено", uid: context.params.userId,
          sample: found.map((field) => String(user[field]).slice(0, 300))});
      } catch (err) {
        logger.error("moderateUser failed", {path: change.after.ref.path,
          error: err.message});
      }
    });
