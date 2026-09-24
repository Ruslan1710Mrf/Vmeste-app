const functions = require("firebase-functions/v1");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const {initializeApp} = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();

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

exports.sendVerificationEmail = functions.auth.user()
    .onCreate(async (user) => {
      if (!user.email) {
        logger.info("No email, skipping", {uid: user.uid});
        return;
      }

      try {
        const link = await getAuth()
            .generateEmailVerificationLink(user.email);

        const html = [
          "<div style=\"font-family: sans-serif; max-width: 480px;",
          "margin: 0 auto;\">",
          "<h2>Добро пожаловать в Vmeste!</h2>",
          "<p>Подтвердите свой email, нажав на кнопку ниже:</p>",
          "<a href=\"" + link + "\" style=\"display:inline-block;",
          "padding: 12px 24px; background:#4F46E5; color:#fff;",
          "text-decoration:none; border-radius:8px;\">",
          "Подтвердить email</a>",
          "<p>Если кнопка не работает, перейдите по ссылке:",
          "<br>" + link + "</p>",
          "</div>",
        ].join(" ");

        await getFirestore().collection("mail").add({
          to: [user.email],
          message: {
            subject: "Подтвердите ваш email — Vmeste",
            html: html,
          },
        });

        logger.info("Email queued", {uid: user.uid});
      } catch (err) {
        logger.error("Failed to queue email", {
          uid: user.uid,
          error: err.message,
        });
      }
    });

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
