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
- **Решение 02.10.2026: Apple — в самом конце.** Сначала исправляем ошибки (ветка `fix/review-bugs`), полная перепроверка, новый билд (20) с исправлениями, тест в TestFlight — и отправляем его вместо 16.
- Демо-аккаунт для ревьюера: r17m89gr@gmail.com, вход через Email/Password (не Google/Apple), подтверждён, вписан в App Review Information. Пароль — у Руслана, в репозиторий не писать.

### Осталось до отправки Apple (по порядку)
0. Выкатить правила Firestore и удалить функцию `sendVerificationEmail` (деплой делает Руслан — у Claude он заблокирован); слить `fix/review-bugs` в main; собрать билд 17. → Сделано 07.10: правила выкачены, функция удалена, собран билд 18 (номер 17 был занят), EAS build 581b3292. 13.10 билд 18 загружен в App Store Connect / TestFlight (до этого 3 отправки падали: «A required Apple agreement is missing» — приняли новое Free Apps Agreement и License Agreement 09.10, Apple подхватил не сразу). Paid Apps Agreement НЕ принимали — для бесплатного приложения не нужно. DSA: «не продавец, не в ЕС». 20.10 принято новое License Agreement (LIL260 от 13.10.2026, дедлайн был 28.10). Apple периодически выпускает новые версии соглашений — если отправка падает с «required Apple agreement is missing», первым делом смотреть developer.apple.com/account и App Store Connect → Бизнес → Соглашения.
   → 15.10 тест билда 18 в TestFlight: фильтр (пост, чат), жалоба, комментарии, удаление чата, Terms на входе — ОК. Найдено и исправлено: чужие посты со «(вы)» в author считались своими (Failed to save, переход в свой профиль); 21 экран не был подключён к тёмной теме; добавлено «Заблокировать автора» в меню поста и «Найти людей» в пустых Сообщениях. Собран **билд 19** (EAS e118319b) — его и отправляем в Apple. 15.10 загружен в TestFlight. 16.10 Руслан проверил на iPhone: фильтр, Terms, жалоба, «Заблокировать автора» (посты сразу пропадают), редактирование своего поста, тёмная и светлая тема на всех вкладках — всё ОК. Остались только видео и отправка.
   → 16.10 проверка по правилам Apple: найден риск 5.1.2 (данные в сторонний AI без согласия). Добавлено окно согласия перед первым вопросом AI-помощнику + «не юридическая консультация». Собран **билд 20** (EAS 1edb8153) — отправляем его. Видео можно снимать на 19 (жалоба/блок/фильтр не менялись).
1. TestFlight билд 20 на iPhone (окно согласия в AI-чате; остальное проверено на 19) (особенно тёмная тема на всех экранах): фильтр блокирует мат в посте; Terms открывается с экрана входа; фото профиля грузится; email поддержки правильный.
2. Опционально: вид на iPad (`supportsTablet: false`, но ревьюер на iPad) — модалки.
3. Видео на iPhone: экран входа → открыть Terms ДО входа → Report на посте → Block пользователя → попытка поста с матом отклонена.
4. App Store Connect: привязать новый билд (20) к версии 1.0; видео в Notes App Review Information; Reply ревьюеру (текст ниже); «Повторно отправить на проверку».

Текст ответа Apple (отправить с видео):

> Hello, and thank you for the review. We have implemented a method for filtering objectionable content, which was the outstanding requirement. All user-generated content is now automatically screened before publishing — posts, post edits, comments, direct messages, event listings, and profile name/bio. Content containing profanity, slurs, or hate speech is rejected and never published, and the user is shown a message. This is included in build 20. Our Terms of Use also state the zero-tolerance policy, the automated filtering, and our commitment to act on reports within 24 hours. The attached screen recording, captured on a physical device, demonstrates: the Terms of Use / EULA presented before registration and login; the mechanism for users to flag/report objectionable content; the mechanism for users to block abusive users; the content filter rejecting a post that contains objectionable language. Demo account (Email/Password sign-in): Email: r17m89gr@gmail.com, Password: [пароль у Руслана]. Thank you.

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
- **AI перенесён с Railway в Firebase (02.11.2026).** Функция `aiChat` (v2 onRequest, us-central1), ключ Anthropic в Secret Manager (`ANTHROPIC_API_KEY`). Приложение → https://us-central1-veste-app-bffb0.cloudfunctions.net/aiChat (lib/claudeApi.js). Ключ `vmeste-firebase` в аккаунте Anthropic ruslanmrf17101989@gmail.com, кредиты куплены ($20). Проверено на iPhone: окно согласия + ответ + разметка OK. ГРАБЛИ: ключ vmeste-firebase истекает ~2.12.2026 (ставили 30 дней) — пересоздать с Never и переложить секрет, иначе AI встанет. Railway больше НЕ нужен (server/aiProxy.js оставлен для локального dev), аккаунт Railway можно закрыть. Старый утёкший ключ Anthropic искать не стали — новый аккаунт отдельный, старый ничего не обслуживает.
- **21.10.2026 утечка env на Railway** (их инцидент безопасности). В env лежали ANTHROPIC_API_KEY и ключ Firebase Admin (сервисный аккаунт firebase-adminsdk-fbsvc). Аккаунт fbsvc удалён (восстановим 30 дней, если понадобится). Прокси переделан (eb56f38): Firebase только по FIREBASE_PROJECT_ID, приватный ключ не нужен. В Railway Variables оставить FIREBASE_PROJECT_ID=veste-app-bffb0 и новый ANTHROPIC_API_KEY; FIREBASE_CLIENT_EMAIL и FIREBASE_PRIVATE_KEY удалить — но только после деплоя нового кода. Системные App Engine / Compute default аккаунты НЕ удалять — на них работают Cloud Functions.
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

## ПЕРЕДАЧА / HANDOFF (02.11.2026)
Статус на момент передачи (можно продолжать в другом инструменте):

СДЕЛАНО:
- Все правки под Apple готовы и в main (последний коммит e04e562, всё на GitHub).
- Билд 21 собран (EAS cd6c38b6) и загружен в TestFlight. App Version 1.0.0 (21).
- AI перенесён с Railway в Cloud Function `aiChat` (us-central1). Приложение → https://us-central1-veste-app-bffb0.cloudfunctions.net/aiChat (lib/claudeApi.js). server/aiProxy.js оставлен только для локального dev.

БЛОКЕР (чинить первым): AI в приложении отвечает «Не удалось получить ответ».
Причина из логов `firebase functions:log --only aiChat`: Anthropic → `invalid x-api-key`.
Значение ANTHROPIC_API_KEY в Secret Manager невалидно (вероятно лишний символ при вводе).
Полное значение существующего ключа посмотреть нельзя. ЧИНИТЬ ТАК:
  1. console.anthropic.com под ruslanmrf17101989@gmail.com (НЕ vmestegroup — тот аккаунт
     создался случайно, пустой). Create Key → имя vmeste-firebase-2 → Expires: Never →
     Scope: Default → скопировать sk-ant-…
  2. firebase functions:secrets:set ANTHROPIC_API_KEY --project veste-app-bffb0
     (вставить аккуратно, без пробелов/переноса; на вопрос про версию y)
  3. firebase deploy --only functions --project veste-app-bffb0
  4. Проверить в приложении (AI tab). Если опять invalid — заложить ключ через веб
     Google Secret Manager (console.cloud.google.com → Secret Manager → ANTHROPIC_API_KEY
     → Add new version) и передеплоить.
Аккаунт ruslanmrf17101989@gmail.com — бесплатный тариф Anthropic; на пробных кредитах AI
отвечал утром 02.11. Для реальных пользователей до публикации купить credits $20.
В Anthropic НЕ удалять ключ vmeste-firebase-2 — на нём работает приложение.

ОСТАЛОСЬ ДО APPLE (после починки ключа):
1. TestFlight билд 21 на iPhone: AI отвечает + окно согласия; мат в посте; Terms с входа;
   жалоба; «Заблокировать автора»; тёмная/светлая тема.
2. Видео на iPhone (сценарий): экран входа → Условия использования → вход демо-аккаунтом
   r17m89gr@gmail.com → чужой пост ⋯ Пожаловаться → ⋯ Заблокировать автора (посты пропали)
   → новый пост с матом → «Недопустимый контент».
3. App Store Connect: версия 1.0 → Сборка = 21; видео в App Review Information; Reply
   ревьюеру (текст в этом файле выше, поменять «build 20» → «build 21»); «Повторно отправить».

ОТЛОЖЕНО (не блокирует Apple):
- Railway закрыть (не нужен, −$5/мес).
- Аккаунт Anthropic ruslan@vmestegroup.app создался случайно и пуст — можно удалить.
- Купить credits Anthropic $20 до публикации.
- Новая иконка + редизайн по макету design/stitch-v3 — обновлением 1.1.
- Старый ключ Anthropic (до 21.10, обслуживал Railway) в списке Default не виден; если
  найдётся в другом workspace/аккаунте — удалить.

## ПЛАН ПОСЛЕ ОТВЕТА APPLE (03.11.2026)
**Всё готовое сведено в ветку `release/1.1`; порядок действий и тест — `docs/release-1.1-checklist.md`.** Ветки feature/notifications, feature/server-moderation, feature/ai-prompt — уже внутри, отдельно не сливать. Редизайн и иконку делает Codex.

Билд 21 — «Ожидание проверки». До ответа Apple в App Store Connect ничего не менять, новые билды не грузить.
Работа в отдельных ветках проверку не затрагивает (Apple видит только загруженный билд).

**Если одобрили:** публикуем 1.0 → билд 22 → версия 1.1.
**Если отклонили:** сначала чиним замечание Apple, остальное ждёт.

### Билд 22 (быстрые правки)
- Закоммитить код Codex с Mac (BlockedUsersScreen, кнопка «Опубликовать» внизу, «Иммиграция» → «Интеграция»), проверить в симуляторе iPhone + iPad.
- Убрать/подписать «скоро» переключатель «Push-уведомления» (`screens/SettingsScreen.js`, `pushEnabled` ни на что не влияет).
- Экран «Уведомления» всегда пуст (`data/notifications.js` = `[]`) — скрыть пункт меню или текст «скоро».
- «Иммиграция» → «Интеграция» по приложению (~118 мест, вкл. системный промпт AI в `lib/claudeApi.js`).

### Уведомления — состояние на 03.11
Push НЕ реализован: нет `expo-notifications`, нет токенов, в `functions/` нет отправки. Пользователям ничего не приходит; письма — только Руслану о жалобах.
→ Сделано в `release/1.1` (не задеплоено): пуши о сообщениях и комментариях, напоминания о событиях за 24 ч и 1 ч, экран «Уведомления» на реальных данных, переключатели «Push» и «Напоминания» работают. Серверная модерация: `functions/moderation.js`. Фильтр для функций — копия, обновлять `node scripts/sync-content-filter.js` после правки `utils/contentFilter.js`.

### Уведомления — план для 1.1 (по приоритету)
1. Основа: `expo-notifications`; APNs-ключ через `eas credentials` (нужен вход Руслана в Apple Developer); FCM для Android; разрешение просить в момент действия (не на старте); токен в `users/{uid}`, удалять при выходе/удалении аккаунта.
2. События: личное сообщение → комментарий к моему посту → ответ на комментарий → напоминание о событии. Лайки — только в экране «Уведомления», без пуша.
3. Правила: не слать от заблокированных; учитывать настройки (отдельно «Сообщения / Комментарии / События»); текст пуша через `containsObjectionableContent`; склеивать серии сообщений.
4. Экран «Уведомления»: `notifications/{uid}/items` пишет та же Cloud Function; счётчик непрочитанных; тап → нужный чат/пост.
5. Проверка только на реальных iPhone/Android. Обновить `privacy.html` (храним push-токен).
Оценка: основа + сообщения + комментарии ≈ 1–2 дня.

### Новый дизайн (1.1)
Макет `design/stitch-v3` (feed, jobs, profile, resources, ai_assistant, visual system). Новая иконка — там же.

### Сайт vmestegroup.app (до деплоя)
Проверить регистрацию «Vmeste Group LLC» (нет — убрать «LLC»); убрать «визы/грин-карту» с главной; блок «решения для бизнеса» — как «свяжитесь с нами»; подпись в `404.html`/`support.html` → «интеграция». Юридические документы — после консультации с юристом; налоги/LLC — с бухгалтером.
