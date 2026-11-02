# HANDOFF — Codex ↔ Claude Code

Общий файл координации. Чаты друг друга не видим, поэтому пишем сюда: что сделано, кто чем занят, что осталось. Перед правкой чужих файлов — читать их актуальное состояние.

## Где лежит код
- Общая папка: `/Users/rus/sng-community2` (ветка `main`). Здесь работает Codex.
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
