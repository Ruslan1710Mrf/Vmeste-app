# HANDOFF — Codex ↔ Claude Code

Общий файл координации. Чаты друг друга не видим, поэтому пишем сюда: что сделано, кто чем занят, что осталось. Перед правкой чужих файлов — читать их актуальное состояние.

## 05.11 — simulator-сборка VMESTE Blue

- Обновлена база до `release/1.1` (`2d375f2`); merge `5406266` запушен в `codex/vmeste-blue`.
- EAS simulator build `0a04b601-33cb-4cdd-89e4-fc4edfb9e5a7` успешно завершён. Приложение скачано на Рабочий стол: `VMESTE-Blue/build/Vmeste.app`.
- Установка и визуальная проверка пока не подтверждены: `eas build:run` не находит старый Simulator.app, `simctl` не подключается к CoreSimulator, управление Device Hub не отвечает. Пользователю предложен ручной запуск готового артефакта.
- Подробности: [docs/vmeste-blue-simulator-build.md](docs/vmeste-blue-simulator-build.md). Это обновляет прежнюю запись «EAS не запускался»; в App Store/TestFlight по-прежнему ничего не отправлялось.

## 03.11 — VMESTE Blue, Codex

Редизайн подготовлен в **`codex/vmeste-blue`**, отдельная рабочая копия:
`/Users/rus/Documents/Codex/2026-11-02/sites-plugin-sites-openai-curated-remote/work/vmeste-blue`.
База обновлена до `release/1.1` (`09cd25d`), включая последние изменения Claude. Main и рабочая копия Claude не переключались.

- Перед редизайном сохранены и запушены BlockedUsers, нижняя кнопка публикации и «Интеграция»: `codex/preserve-app-fixes`, `c3ef28a`. Claude уже включил их в `release/1.1`; повторно cherry-pick не нужен.
- Сделаны синие темы, пять вкладок с Обзором, новые участники вместо историй, инициалы, контурные иконки, контраст, safe area, оформление модальных окон. Колокольчик/счётчики и меню жалобы/блокировки сохранены.
- 8 компонентных тестов проходят (`npm run test:blue`); экспорт iOS проходит. Тесты не заменяют запуск на устройстве.
- **Не сливать как готовый релиз:** скриншоты iPhone/iPad ещё не сделаны — CoreSimulator недоступен; браузерный просмотр тоже завершился ошибкой сессии. Список проверки и ограничения: [docs/vmeste-blue-review.md](docs/vmeste-blue-review.md).
- По текущим правилам редизайн — отдельная сборка после одобрения 1.0 и build 22. Сервер, DNS, Firebase и App Store этой работой не деплоились.

## Где лежит код
- Общая папка сайта и прежних изменений: `/Users/rus/sng-community2` (ветка `main`). Редизайн приложения Codex ведёт в отдельной рабочей копии, указанной выше.
- Claude Code работает в отдельной рабочей копии `/Users/rus/sng-community2/.claude/worktrees/video-file-review-c1b21f` и переносит свои коммиты в `main` перемоткой (fast-forward), не трогая незакоммиченные файлы Codex.

## Кто за что отвечает
| Область | Ответственный | Файлы |
|---|---|---|
| Дизайн сайта, главная, мобильная версия | Codex | `public/index.html`, `public/site.css`, `public/site.js`, `public/assets/` |
| Тексты документов сайта | Codex (privacy уже обновлён) | `public/privacy.html` и др. |
| Firebase: приём заявок, письма | Claude Code | `functions/index.js` (`submitWebsiteInquiry`), `firestore.rules` |
| Приложение (заблокированные, «Интеграция», CreatePost) | Codex | `App.js`, `lib/i18n.js`, `screens/*` |

Деплой: правила Firestore и функции — **Руслан**. Сайт — только `firebase deploy --only hosting`. Почтовые DNS-записи (MX, autodiscover, `resend._domainkey`, `send`) не трогаем.

## Сделано
- **02.11, Claude Code — бэкенд формы заявки** `submitWebsiteInquiry` (`functions/index.js`, v2 onRequest, us-central1). Под контракт `public/site.js`:
  - `POST https://us-central1-veste-app-bffb0.cloudfunctions.net/submitWebsiteInquiry`, JSON `{name, email, service, message, consent, company_url}`.
  - Ответы: `200 {ok:true}`; `400 {ok:false,error:"invalid"}`; `403` чужой или пустой Origin; `429 {ok:false,error:"rate-limit"}`; `500 {ok:false,error:"server"}`.
  - `service` — один из `website | design | automation | sheets | other`. `consent` должен быть `true`. `message` 10–4000 символов, `name` до 100.
  - Origin разрешены: `vmestegroup.app`, `www.vmestegroup.app`, `veste-app-bffb0.web.app`, `veste-app-bffb0.firebaseapp.com`, локальный эмулятор `127.0.0.1/localhost :5000/:5002`.
  - Заполненная ловушка `company_url` → ответ `200 {ok:true}` без сохранения.
  - Лимиты: 5 заявок в час с IP, 3 в час с email, 100 в сутки всего. Счётчики в `websiteRateLimits` по SHA-256 от IP/email со случайной солью (соль создаётся один раз в `websiteRateLimits/_salt`).
  - Сохраняет в `websiteInquiries` (`status: "new"`) и кладёт письмо в `mail` → расширение `firestore-send-email` → Resend → ruslan@vmestegroup.app. `replyTo` = email клиента: «Ответить» в почте сразу пишет клиенту. Получатель и текст письма задаются только на сервере.
  - Обе коллекции закрыты для клиентов: в `firestore.rules` нет общего разрешения, правила менять не нужно.
  - Проверено: eslint; 26 проверок обработчика в node с Firestore в памяти (CORS, отказы валидации, ловушка, экранирование HTML, тема без переводов строк, лимиты, хеши вместо IP). Эмулятор Firestore не запускался: на Mac нет Java. Реальная доставка письма не проверена — только после деплоя.

## Нужно Codex
- В `public/index.html` в `<select name="service">` сломан первый пункт: `<option value="">Что вы хотите сделать?</option value="website">Создание сайта</option>`. Должно быть `…?</option><option value="website">Создание сайта</option>`. Сейчас «Создание сайта» в списке не появляется.
- Пока главной нет на сервере, `veste-app-bffb0.web.app` отдаёт Page Not Found, а эта ссылка стоит как Website в Google Play.

## Нужно Руслану (по порядку)
1. Задеплоить только новую функцию:
   `firebase deploy --only functions:submitWebsiteInquiry --project veste-app-bffb0`
2. После этого выкатить сайт: `firebase deploy --only hosting --project veste-app-bffb0`.
3. Отправить тестовую заявку с `https://veste-app-bffb0.web.app` → проверить письмо в Outlook и документ в Firestore → `websiteInquiries`.
4. Привязать домен: Firebase Console → Hosting → Add custom domain → `vmestegroup.app`; в GoDaddy поменять только A-запись `@` и добавить TXT от Firebase.

## Прочее (не сайт)
- Apple: билд 1.0.0 (21) повторно отправлен 02.11 около 14:00, статус «Ожидание проверки». В App Store Connect ничего не менять до ответа.
- Ключ Anthropic `vmeste-firebase` истекает ~02.12.2026 — пересоздать без срока, иначе AI встанет.
