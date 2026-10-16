@AGENTS.md

# Вместе (Vmeste) — памятка

## Стек и идентификаторы
- Expo SDK 56 (React Native 0.85), Firebase JS SDK 12, Cloud Functions в `functions/`.
- Firebase-проект: `veste-app-bffb0`, план Blaze.
- Bundle ID / package: `com.vmeste.group`. App Store ID: `6796509921`.
- Сборка/отправка:
  - `eas build --platform ios --profile production`
  - `eas submit --platform ios --profile production`
  - (Android — то же с `--platform android`.)
- Xcode 27 установлен (13.10.2026), но системный `xcode-select` смотрит на CommandLineTools (sudo-пароль не прошёл). Для симулятора и локальных сборок — `export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` перед командами, sudo не нужен.

## Статус и задачи

### Apple App Store — главное сейчас
- История отклонений: 1-е — Guideline 2.1 (запрос информации). 2-е, актуальное — Guideline 1.2 (UGC): не хватало ТОЛЬКО «method for filtering objectionable content». Report, Block и EULA Apple признала. Ревьюер тестирует на iPad Air 11" (M3).
- Apple просит: screen recording с физического устройства (EULA до входа → жалоба на контент → блокировка пользователя), положить в Notes раздела App Review Information, ответить в Reply и нажать «Повторно отправить».
- Фильтр сделан: `utils/contentFilter.js`, `containsObjectionableContent()`, 6 точек: создание/редактирование поста, событие, комментарий, профиль (имя + bio), чат. Ложных срабатываний на тестах нет.
- Документы на Firebase Hosting обновлены: `terms.html` (zero tolerance, автофильтр, реакция на жалобы за 24 ч), `child-safety.html` (убрано «автоматического сканирования нет»), `privacy.html`. Контакт везде ruslan@vmestegroup.app (support@vmeste.app был мёртвый — заменён).
- Удаление аккаунта работает для email, Google, Apple (проверено на билде 13).
- Билд 16 = фильтр + рабочий email поддержки, залит в App Store Connect.
- **Решение 02.10.2026: Apple — в самом конце.** Сначала исправляем ошибки (ветка `fix/review-bugs`), полная перепроверка, новый билд (19) с исправлениями, тест в TestFlight — и отправляем его вместо 16.
- Демо-аккаунт для ревьюера: r17m89gr@gmail.com, вход через Email/Password (не Google/Apple), подтверждён, вписан в App Review Information. Пароль — у Руслана, в репозиторий не писать.

### Осталось до отправки Apple (по порядку)
0. Выкатить правила Firestore и удалить функцию `sendVerificationEmail` (деплой делает Руслан — у Claude он заблокирован); слить `fix/review-bugs` в main; собрать билд 17. → Сделано 07.10: правила выкачены, функция удалена, собран билд 18 (номер 17 был занят), EAS build 581b3292. 13.10 билд 18 загружен в App Store Connect / TestFlight (до этого 3 отправки падали: «A required Apple agreement is missing» — приняли новое Free Apps Agreement и License Agreement 09.10, Apple подхватил не сразу). Paid Apps Agreement НЕ принимали — для бесплатного приложения не нужно. DSA: «не продавец, не в ЕС».
   → 15.10 тест билда 18 в TestFlight: фильтр (пост, чат), жалоба, комментарии, удаление чата, Terms на входе — ОК. Найдено и исправлено: чужие посты со «(вы)» в author считались своими (Failed to save, переход в свой профиль); 21 экран не был подключён к тёмной теме; добавлено «Заблокировать автора» в меню поста и «Найти людей» в пустых Сообщениях. Собран **билд 19** (EAS e118319b) — его и отправляем в Apple.
1. TestFlight билд 19 на iPhone (особенно тёмная тема на всех экранах): фильтр блокирует мат в посте; Terms открывается с экрана входа; фото профиля грузится; email поддержки правильный.
2. Опционально: вид на iPad (`supportsTablet: false`, но ревьюер на iPad) — модалки.
3. Видео на iPhone: экран входа → открыть Terms ДО входа → Report на посте → Block пользователя → попытка поста с матом отклонена.
4. App Store Connect: привязать новый билд (19) к версии 1.0; видео в Notes App Review Information; Reply ревьюеру (текст ниже); «Повторно отправить на проверку».

Текст ответа Apple (отправить с видео):

> Hello, and thank you for the review. We have implemented a method for filtering objectionable content, which was the outstanding requirement. All user-generated content is now automatically screened before publishing — posts, post edits, comments, direct messages, event listings, and profile name/bio. Content containing profanity, slurs, or hate speech is rejected and never published, and the user is shown a message. This is included in build 19. Our Terms of Use also state the zero-tolerance policy, the automated filtering, and our commitment to act on reports within 24 hours. The attached screen recording, captured on a physical device, demonstrates: the Terms of Use / EULA presented before registration and login; the mechanism for users to flag/report objectionable content; the mechanism for users to block abusive users; the content filter rejecting a post that contains objectionable language. Demo account (Email/Password sign-in): Email: r17m89gr@gmail.com, Password: [пароль у Руслана]. Thank you.

### Прочие хвосты
- Railway (аккаунт на rm01profi@gmail.com): 28.09 проекты были на паузе за неоплату (карта не проходила с 18.09). Оплачено 02.10, $5, квитанция #2198-7744, карта …5818; оплачен период до 18.10. Следующее списание ~18.10 — проверить, что пройдёт.
- Проверить в Firebase Authentication аккаунты после 18.08 — нет ли неподтверждённых/запертых.
- Outlook ruslan@vmestegroup.app: включена переадресация на GoDaddy Conversations (customer-support@...mail.conversations.godaddy.com) — Руслан её сознательно не включал, проверить/выключить.
- Firebase Extensions закрываются 31.03.2027 → до февраля 2027 заменить `firestore-send-email` своей Cloud Function с Resend API.
- Смена иконки — после публикации, отдельным обновлением.

## Почта — РАБОТАЕТ (с 01.10.2026)
- SendGrid умер 18.08 (триал). Теперь Resend (бесплатно), домен vmestegroup.app verified, DNS в GoDaddy.
- Цепочка: жалоба → `notifyOnNewReport` → коллекция `mail` → расширение `firestore-send-email` → Resend (`smtps://resend@smtp.resend.com:465`) → ruslan@vmestegroup.app. Проверено: Delivered.
- API-ключ Resend лежит в секрете `firestore-send-email-SMTP_PASSWORD-uzfa`, ссылка на версию — `versions/latest`. Секрет без суффикса не используется.
- **ГРАБЛИ: при смене ключа SMTP добавить новую версию секрета НЕДОСТАТОЧНО.** Ревизия Cloud Function прибивается к конкретному номеру версии в момент деплоя и `versions/latest` в рантайме не перечитывает. После смены ключа — Reconfigure расширения (новый ключ в поле SMTP password) или redeploy:
  `firebase ext:export && firebase deploy --only extensions --project veste-app-bffb0`
  Симптомы, если забыть: `535 Authentication credentials invalid` — ревизия читает старый ключ; либо `could not start successfully` вместе с `Secret Version ... is in DISABLED state` — старую версию отключили, и контейнер не стартует.
- Расширение триггерится на запись документа в `mail`. Очередь неудачных писем само не перебирает — после починки нужен новый триггер (новая жалоба/регистрация).
- Старые письма с ERROR в `mail` лежат (TTL never) — не переотправлять.
- Письма подтверждения при регистрации шлёт встроенный `sendEmailVerification` Firebase — от Resend не зависят.

## Модерация
- Жалобы — в коллекции `reports`, читать только через Firebase Console (rules запрещают клиенту). Админки нет.
- Бан = Authentication → Disable account. Посты остаются, удалять вручную.

## Инфраструктура и деньги
- Биллинг Firebase отключался 21.09 (неоплата), восстановлен 30.09.
- AI-ассистент ходит через прокси на Railway (`server/`, `railway.json`, Hobby $5/мес). Проверено: отвечает.
- Документы (privacy, terms, support и т.п.) — на Firebase Hosting (`public/`).
- Контакт: ruslan@vmestegroup.app.

## Правила работы
- Русский, кратко, без воды. Не гонять по кругу. Не писать «иди спать».
- Сначала проверь реальный конфиг/логи (`firebase ext:export`, логи), потом давай шаги. Говори точно, какое значение в какое поле.
- Сам предлагай следующие 2–3 шага и риски.
- `firebase functions:log` вызывать несколько раз — отдаёт неполные срезы.
- Время в логах — UTC; у Руслана Central (UTC−5).
- Пароли и ключи в репозиторий не писать.

## Проверка перед сдачей (обязательно)
Не говорить «готово», пока сам не проверил. Первый вариант не сдавать.
- Любая правка кода → бандл собирается без ошибок: `npx expo export --platform ios --output-dir /tmp/vmeste-check` (тестов в проекте нет, это минимум).
- Правка экрана/UI → запустить в iOS Simulator и приложить скриншот того, что изменилось (на iPhone, и для модалок — на iPad, ревьюер Apple на iPad).
- Правка фильтра (`utils/contentFilter.js`) → прогнать через node: мат блокируется, обычные слова (русские и английские) не блокируются.
- Правка `firestore.rules` / `functions/` → показать дифф и что именно изменится для пользователя; деплой делает Руслан.
- В отчёте писать, что проверено и чем, и что проверить не удалось (например, только на реальном устройстве/TestFlight).
- Если Руслан поправил результат — предложить дописать правило сюда, чтобы не повторялось.
