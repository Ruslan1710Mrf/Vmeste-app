@AGENTS.md

# Вместе (Vmeste) — памятка

## Стек и идентификаторы
- Expo SDK 56 (React Native 0.85), Firebase JS SDK 12, Cloud Functions в `functions/`.
- Firebase-проект: `veste-app-bffb0`.
- Bundle ID / package: `com.vmeste.group`. App Store ID: `6796509921`.
- Сборка/отправка:
  - `eas build --platform ios --profile production`
  - `eas submit --platform ios --profile production`
  - (Android — то же с `--platform android`.)

## Почта
- Расширение `firestore-send-email`, SMTP через Resend: `smtps://resend@smtp.resend.com:465`.
- API-ключ Resend лежит в секрете `firestore-send-email-SMTP_PASSWORD-uzfa` (НЕ в секрете без суффикса), ссылка на версию — `versions/latest`.
- **При смене ключа SMTP добавить новую версию секрета НЕДОСТАТОЧНО.** Ревизия Cloud Function прибивается к конкретному номеру версии в момент деплоя и `versions/latest` в рантайме не перечитывает. После добавления версии обязательно переразвернуть расширение:
  `firebase ext:export && firebase deploy --only extensions --project veste-app-bffb0`
  Симптомы, если забыть: `535 Authentication credentials invalid` — ревизия читает старый ключ; либо `could not start successfully` вместе с `Secret Version ... is in DISABLED state` — старую версию отключили, и контейнер вообще не стартует.
- Расширение триггерится на запись документа в `mail`. Накопившуюся очередь неудачных писем оно само не перебирает — после починки ключа нужен новый триггер (новая жалоба/регистрация).
- Уведомления о жалобах шлёт функция `notifyOnNewReport` на ruslan@vmestegroup.app.

## Инфраструктура
- AI-ассистент ходит через прокси на Railway (`server/`, `railway.json`).
- Документы (privacy, support и т.п.) — на Firebase Hosting (`public/`).
- Контакт: ruslan@vmestegroup.app.

## Статус Apple
- Было отклонение по guideline 1.2 (нужен фильтр контента). Фильтр сделан — отправлять билд 16.

## Правила работы
- Перед любыми инструкциями по настройке сначала проверь реальный конфиг (`firebase ext:export`, логи), потом давай шаги.
- `firebase functions:log` вызывать несколько раз — отдаёт неполные срезы.
- Время в логах — UTC; у пользователя Central (UTC−5).
- Общение на русском, кратко.
