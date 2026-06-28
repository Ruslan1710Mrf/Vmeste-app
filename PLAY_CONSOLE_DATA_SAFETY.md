# Ответы для формы Data Safety в Google Play Console

Раздел Play Console: **Policy → App content → Data safety**

## 1. Does your app collect or share any of the required user data types?
**Да.**

## 2. Сбор данных (Data collection) — отмечаем категории:

### Personal info
- **Name** — собирается, обязательно (профиль)
  - Цель: App functionality, Account management
  - Передаётся третьим лицам: Нет
  - Обрабатывается в пути (in transit): зашифровано (HTTPS/Firebase)
  - Можно удалить: Да (удаление аккаунта в Настройках)
- **Email address** — собирается, обязательно
  - Цель: App functionality, Account management, Communications
  - Передаётся третьим лицам: Нет (хранится в приватном поддокументе, не публично)
- **Phone number** — собирается, опционально (только при входе по SMS)
  - Цель: App functionality, Account management
  - Передаётся третьим лицам: Нет (обрабатывается Firebase/Google для отправки SMS)

### Photos
- **Photos** — собирается, опционально (фото профиля, обложка, фото к посту)
  - Цель: App functionality
  - Передаётся третьим лицам: Нет
  - Можно удалить: Да

### Messages
- **In-app messages** — собирается (личные сообщения между пользователями)
  - Цель: App functionality
  - Передаётся третьим лицам: Нет
  - Видно другим пользователям: только получателю переписки

### App activity
- **Other user-generated content** — посты, комментарии, AI-чат
  - Цель: App functionality
  - AI-чат: текст сообщений передаётся стороннему AI-провайдеру (Anthropic Claude, через собственный сервер-прокси) для генерации ответа — указать в разделе "Third party" ниже

## 3. Is all of the user data collected by your app encrypted in transit?
**Да** (HTTPS / Firebase используют TLS).

## 4. Do you provide a way for users to request that their data is deleted?
**Да** — в приложении: Профиль → Настройки → «Удалить аккаунт». Удаляет профиль, посты, переписки, историю AI-чата.

## 5. Third-party data sharing
- **Firebase / Google Cloud** — инфраструктура (аутентификация, база данных, файлы, хостинг)
- **Anthropic (Claude API)** через собственный сервер-прокси на Railway — обработка текста AI-чата
- Партнёрские ссылки в разделе «Наша база» — это просто внешние ссылки (как браузерная закладка), данные пользователя при этом НЕ передаются партнёру через приложение

## 6. Content rating questionnaire (отдельная анкета, не Data Safety, но рядом)
Отвечайте честно, что в приложении есть:
- User-generated content (посты, профили, чат) — **Да**
- User-to-user communication (личные сообщения) — **Да**
- Ссылки на сторонние сайты — **Да**

Из-за чата и пользовательского контента итоговый рейтинг скорее всего будет не ниже **Teen / 13+** — это нормально, не блокер, просто заполняйте честно (Google сам присвоит рейтинг по ответам).

## 7. Privacy policy URL
```
https://veste-app-bffb0.web.app/privacy
```
(или ваш домен vmestegroup.app/privacy, когда подключите)

---
*Черновик на основе фактической логики приложения. При сомнениях по конкретному пункту формы — лучше выбрать более консервативный (раскрывающий больше, а не меньше) вариант ответа.*
