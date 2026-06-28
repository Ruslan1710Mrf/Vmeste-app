const functions = require("firebase-functions/v1");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const {initializeApp} = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();

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
