import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGE_STORAGE_KEY = 'vmeste:language';

export function localize(value, language) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[language] ?? value.ru ?? value;
  }
  return value;
}

export const TRANSLATIONS = {
  ru: {
    'tabBar.home': 'Главная',
    'tabBar.jobs': 'Работа',
    'tabBar.resources': 'База',
    'tabBar.immigration': 'Иммиграция',
    'tabBar.ai': 'AI',
    'tabBar.networking': 'Нетворкинг',
    'tabBar.profile': 'Профиль',

    'backLabel.home': 'Главная',
    'backLabel.jobs': 'Работа',
    'backLabel.resources': 'Наша база',
    'backLabel.immigration': 'Иммиграция',
    'backLabel.ai': 'AI',
    'backLabel.networking': 'Нетворкинг',
    'backLabel.profile': 'Профиль',

    'home.title': 'Главная',
    'home.composerPlaceholder': 'Что у вас нового?',
    'home.ownStoryLabel': 'История',
    'home.like': 'Нравится',
    'home.share': 'Поделиться',

    'theme.system': 'Системная',
    'theme.light': 'Светлая',
    'theme.dark': 'Тёмная',
    'theme.title': 'Тема оформления',

    'profile.backLabel': 'Главная',
    'profile.personalInfo': 'Личная информация',
    'profile.from': 'Из {value}',
    'profile.status': 'Статус: {value}',
    'profile.memberSince': 'В сообществе с {value}',
    'profile.connections': 'Связи',
    'profile.events': 'События',
    'profile.posts': 'Посты',
    'profile.menu.edit': 'Редактировать профиль',
    'profile.menu.feed': 'Лента сообщества',
    'profile.menu.connections': 'Мои связи',
    'profile.menu.messages': 'Сообщения',
    'profile.menu.events': 'Мои события',
    'profile.menu.checklist': 'Чек-лист адаптации',
    'profile.menu.saved': 'Сохранённое',
    'profile.menu.notifications': 'Уведомления',
    'profile.menu.help': 'Помощь и поддержка',
    'profile.menu.settings': 'Настройки',

    'settings.title': 'Настройки',
    'settings.backLabel': 'Профиль',
    'settings.notifications': 'Уведомления',
    'settings.pushTitle': 'Push-уведомления',
    'settings.pushDesc': 'Новые вакансии и сообщения',
    'settings.emailDigestTitle': 'Email-дайджест',
    'settings.emailDigestDesc': 'Еженедельная сводка',
    'settings.eventRemindersTitle': 'Напоминания о событиях',
    'settings.language': 'Язык',
    'settings.appLanguage': 'Язык приложения',
    'settings.account': 'Аккаунт',
    'settings.email': 'Email',
    'settings.changePassword': 'Сменить пароль',
    'settings.deleteAccount': 'Удалить аккаунт',
    'settings.signOut': 'Выйти из аккаунта',
    'settings.version': 'Vmeste v1.0.0',
    'settings.signOutConfirmTitle': 'Выйти из аккаунта',
    'settings.signOutConfirmMessage': 'Вы уверены, что хотите выйти?',
    'settings.cancel': 'Отмена',
    'settings.confirm': 'Выйти',
    'settings.signOutError': 'Не удалось выйти. Попробуйте снова.',
    'settings.passwordResetSentTitle': 'Готово',
    'settings.passwordResetSentMessage': 'Ссылка для смены пароля отправлена на ваш email',
    'settings.passwordResetError': 'Не удалось отправить письмо. Попробуйте позже.',
    'settings.deleteAccountConfirmTitle': 'Удалить аккаунт?',
    'settings.deleteAccountConfirmMessage':
      'Внимание! Это действие необратимо. Все ваши данные (профиль, посты, сообщения) будут удалены. Продолжить?',
    'settings.delete': 'Удалить',
    'settings.enterPassword': 'Введите пароль',
    'settings.passwordPromptDesc': 'Для подтверждения удаления аккаунта введите ваш пароль',
    'settings.passwordPlaceholder': 'Пароль',
    'settings.passwordRequiredError': 'Введите пароль для подтверждения',
    'settings.accountDeletedTitle': 'Аккаунт удалён',
    'settings.accountDeletedMessage': 'Ваш аккаунт был успешно удалён.',
    'settings.ok': 'OK',
    'settings.error': 'Ошибка',
    'settings.genericDeleteError': 'Не удалось удалить аккаунт. Проверьте пароль и попробуйте снова.',

    'auth.tagline.login': 'Сообщество для соотечественников в США',
    'auth.tagline.register': 'Создайте аккаунт за минуту',
    'auth.login.title': 'Вход',
    'auth.login.subtitle': 'Войдите — мы загрузим ваш профиль из базы данных',
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Пароль',
    'auth.showPassword': 'Показать пароль',
    'auth.hidePassword': 'Скрыть пароль',
    'auth.login.submit': 'Войти',
    'auth.login.phoneButton': '📱 Войти по номеру телефона',
    'auth.login.googleButton': 'Войти через Google',
    'auth.login.forgotPassword': 'Забыли пароль?',
    'auth.login.noAccount': 'Нет аккаунта? Зарегистрироваться',
    'auth.register.title': 'Регистрация',
    'auth.register.subtitle': 'После регистрации ваш профиль сохранится в базе данных',
    'auth.register.firstName': 'Имя',
    'auth.register.firstNamePlaceholder': 'Мария',
    'auth.register.lastName': 'Фамилия',
    'auth.register.lastNamePlaceholder': 'Иванова',
    'auth.register.password': 'Пароль',
    'auth.register.confirmPassword': 'Подтвердите пароль',
    'auth.register.confirmPasswordPlaceholder': 'Повторите пароль',
    'auth.register.passwordPlaceholder': 'Минимум 6 символов',
    'auth.register.submit': 'Зарегистрироваться',
    'auth.register.haveAccount': 'Уже есть аккаунт? Войти',
    'auth.errors.fillEmailPassword': 'Заполните email и пароль',
    'auth.errors.fillAllFields': 'Заполните все поля',
    'auth.errors.passwordTooShort': 'Пароль должен быть не менее 6 символов',
    'auth.errors.passwordMismatch': 'Пароли не совпадают',
    'auth.errors.generic': 'Произошла ошибка. Попробуйте снова',
    'auth.errors.googleGeneric': 'Не удалось войти через Google. Попробуйте снова',
    'auth.errors.emailInUse': 'Этот email уже зарегистрирован',
    'auth.errors.invalidEmail': 'Неверный формат email',
    'auth.errors.userNotFound': 'Пользователь не найден',
    'auth.errors.wrongPassword': 'Неверный пароль',
    'auth.errors.invalidCredential': 'Неверный email или пароль',
    'auth.errors.tooManyRequests': 'Слишком много попыток. Попробуйте позже',
    'auth.errors.missingPassword': 'Введите пароль',
    'auth.errors.accountExistsDifferentCredential':
      'Аккаунт с этим email уже зарегистрирован другим способом',
    'auth.errors.popupClosed': 'Вход отменён',
    'auth.errors.emailNotVerified': 'Подтвердите email перед входом. Проверьте почту.',
    'auth.errors.enterEmail': 'Введите email',

    'auth.forgotPassword.backLink': '← Назад ко входу',
    'auth.forgotPassword.title': 'Сброс пароля',
    'auth.forgotPassword.subtitle': 'Введите email — мы отправим ссылку для восстановления доступа',
    'auth.forgotPassword.submit': 'Отправить ссылку',
    'auth.forgotPassword.successMessage': 'Ссылка для сброса пароля отправлена на ваш email',
    'auth.forgotPassword.backToLogin': 'Вернуться ко входу',

    // FeedScreen.js
    'feed.backLabel': 'Главная',
    'feed.title': 'Лента',
    'feed.subtitle': 'Посты от сообщества',
    'feed.writePost': 'Написать пост',
    'feed.emptyTitle': 'Нет постов в этой категории',
    'feed.emptyText': 'Попробуйте другой фильтр или напишите первым',

    // PostDetailScreen.js
    'postDetail.back': 'Назад',
    'postDetail.justNow': 'Только что',
    'postDetail.comments': 'Комментарии ({value})',
    'postDetail.beFirstComment': 'Будьте первым — оставьте комментарий',
    'postDetail.commentPlaceholder': 'Написать комментарий...',
    'postDetail.send': 'Отправить',

    // CreatePostScreen.js
    'createPost.galleryPermissionError': 'Нужен доступ к галерее, чтобы прикрепить фото',
    'createPost.addTextOrPhotoError': 'Добавьте текст или фото',
    'createPost.saveError': 'Не удалось сохранить. Попробуйте снова.',
    'createPost.publishError': 'Не удалось опубликовать. Попробуйте снова.',
    'createPost.cancel': 'Отмена',
    'createPost.editTitle': 'Редактировать пост',
    'createPost.newTitle': 'Новый пост',
    'createPost.textLabel': 'Текст',
    'createPost.textPlaceholder': 'Поделитесь с сообществом...',
    'createPost.photoLabel': 'Фото',
    'createPost.removePhoto': 'Удалить фото',
    'createPost.attachPhoto': 'Прикрепить фото',
    'createPost.categoryLabel': 'Категория',
    'createPost.save': 'Сохранить',
    'createPost.publish': 'Опубликовать',

    // MyPostsScreen.js
    'myPosts.backLabel': 'Профиль',
    'myPosts.title': 'Мои посты',
    'myPosts.postCountSingular': 'публикация',
    'myPosts.postCountPlural': 'публикаций',
    'myPosts.writePost': 'Написать пост',
    'myPosts.emptyTitle': 'Пока нет постов',
    'myPosts.emptyText': 'Поделитесь опытом или задайте вопрос сообществу',

    // PostOptionsMenu.js
    'postMenu.editPost': 'Редактировать пост',
    'postMenu.deletePost': 'Удалить пост',
    'postMenu.report': 'Пожаловаться',
    'postMenu.cancel': 'Отмена',

    // CapturablePostCard.js
    'postCard.downloadCta': 'Скачать в App Store / Google Play',

    // ShareSheet.js
    'shareSheet.title': 'Поделиться постом',
    'shareSheet.cancel': 'Отмена',

    // ShareButtons.js
    'shareButtons.downloadCta': 'Скачать {value}: https://vmestegroup.app',
    'shareButtons.openAppErrorTitle': 'Не удалось открыть приложение',
    'shareButtons.openAppErrorMessage': 'Проверьте, установлено ли оно.',
    'shareButtons.noImageTitle': 'Нет изображения',
    'shareButtons.noImageMessage': '{value} принимает только картинку/видео — сначала нужно сделать снимок поста.',
    'shareButtons.sharingUnavailable': 'Шеринг недоступен на этом устройстве',
    'shareButtons.shareToInstagram': 'Поделиться в Instagram',
    'shareButtons.shareToTikTok': 'Поделиться в TikTok',

    // NetworkingScreen.js
    'networking.attendees': '{value} участников',
    'networking.membersCount': '{value} участников',
    'networking.join': 'Вступить',
    'networking.title': 'Нетворкинг',
    'networking.subtitle': 'События, группы и знакомства в diaspora-сообществе',
    'networking.searchPlaceholder': 'Поиск событий, групп, людей...',
    'networking.noResults': 'Ничего не найдено',
    'networking.upcomingEvents': 'Ближайшие события',
    'networking.create': 'Создать',
    'networking.communities': 'Сообщества',
    'networking.peopleNearYou': 'Люди рядом с вами',

    // ConnectionsScreen.js
    'connections.backLabel': 'Профиль',
    'connections.title': 'Мои связи',
    'connections.peopleCount': '{value} человек',
    'connections.emptyTitle': 'Пока нет связей',
    'connections.emptyText': 'Добавляйте людей через раздел «Нетворкинг»',

    // MemberDetailScreen.js
    'memberDetail.back': 'Назад',
    'memberDetail.about': 'О себе',
    'memberDetail.interests': 'Интересы',
    'memberDetail.userBlocked': 'Пользователь заблокирован',
    'memberDetail.unblock': 'Разблокировать',
    'memberDetail.inYourConnections': 'В ваших связях',
    'memberDetail.sendMessage': 'Написать сообщение',
    'memberDetail.addToConnections': 'Добавить в связи',
    'memberDetail.mutualConnections': 'Общие связи ({value})',
    'memberDetail.posts': 'Посты',
    'memberDetail.noPosts': 'Пока нет публикаций',

    // MessagesScreen.js
    'messages.defaultUserName': 'Пользователь',
    'messages.startConversation': 'Начните переписку',
    'messages.backLabel': 'Профиль',
    'messages.errorTitle': 'Ошибка',
    'messages.deleteConversationError': 'Не удалось удалить переписку. Попробуйте позже.',
    'messages.deleteConversationConfirmTitle': 'Удалить переписку?',
    'messages.deleteConversationConfirmMessage': 'Восстановить её будет невозможно.',
    'messages.cancel': 'Отмена',
    'messages.delete': 'Удалить',
    'messages.title': 'Сообщения',
    'messages.conversationsCount': '{value} диалогов',
    'messages.chooseFriend': 'Выберите друга',
    'messages.emptyTitle': 'Пока нет сообщений',
    'messages.signInToMessage': 'Войдите в аккаунт, чтобы отправлять и получать сообщения',
    'messages.addFriendsToStart': 'Добавьте друзей в разделе «Нетворкинг», чтобы начать переписку',

    // ChatScreen.js
    'chat.openChatError': 'Не удалось открыть чат. Попробуйте снова.',
    'chat.chatLoadingError': 'Чат ещё загружается. Подождите секунду и попробуйте снова.',
    'chat.sendMessageError': 'Не удалось отправить сообщение. Попробуйте снова.',
    'chat.writeFirstMessage': 'Напишите первое сообщение',
    'chat.messagePlaceholder': 'Сообщение...',

    // MemberOptionsMenu.js
    'memberMenu.report': 'Пожаловаться на пользователя',
    'memberMenu.block': 'Заблокировать',
    'memberMenu.unblock': 'Разблокировать',
    'memberMenu.cancel': 'Отмена',

    // JobsScreen.js
    'jobs.title': 'Работа',
    'jobs.subtitle': '{value} вакансий для нашего сообщества',
    'jobs.searchPlaceholder': 'Поиск по должности, компании, городу...',
    'jobs.empty': 'Ничего не найдено',

    // JobDetailScreen.js
    'jobDetail.back': 'Назад',
    'jobDetail.linkUnavailableTitle': 'Ссылка недоступна',
    'jobDetail.linkUnavailableMessage': 'Для этой вакансии пока нет ссылки на отклик.',
    'jobDetail.linkOpenFailedTitle': 'Не удалось открыть ссылку',
    'jobDetail.tryAgainLater': 'Попробуйте позже.',
    'jobDetail.city': 'Город',
    'jobDetail.salary': 'Зарплата',
    'jobDetail.description': 'Описание',
    'jobDetail.requirements': 'Требования',
    'jobDetail.apply': 'Откликнуться',

    // SavedJobsScreen.js
    'savedJobs.backLabel': 'Профиль',
    'savedJobs.title': 'Сохранённое',
    'savedJobs.subtitle': '{value} сохранённых вакансий',
    'savedJobs.emptyTitle': 'Пока пусто',
    'savedJobs.emptyText': 'Сохраняйте интересные вакансии, нажав на закладку',

    // EventDetailScreen.js
    'eventDetail.back': 'Назад',
    'eventDetail.organizer': 'Организатор: {value}',
    'eventDetail.city': 'Город',
    'eventDetail.venue': 'Место',
    'eventDetail.attendeesLabel': 'Участники',
    'eventDetail.attendeesValue': '{value} человек',
    'eventDetail.about': 'О событии',
    'eventDetail.agenda': 'Программа',
    'eventDetail.registered': 'Вы зарегистрированы!',
    'eventDetail.register': 'Зарегистрироваться',

    // CreateEventScreen.js
    'createEvent.errorRequiredFields': 'Заполните название, дату и город',
    'createEvent.errorGeneric': 'Не удалось создать событие. Попробуйте снова.',
    'createEvent.cancel': 'Отмена',
    'createEvent.newEvent': 'Новое событие',
    'createEvent.titleLabel': 'Название',
    'createEvent.titlePlaceholder': 'Например: Встреча предпринимателей СНГ',
    'createEvent.dateLabel': 'Дата и время',
    'createEvent.datePlaceholder': 'Например: 12 июля · 18:00',
    'createEvent.cityLabel': 'Город',
    'createEvent.cityPlaceholder': 'Например: Нью-Йорк',
    'createEvent.venueLabel': 'Место проведения',
    'createEvent.venuePlaceholder': 'Например: Central Park, Sheep Meadow',
    'createEvent.descriptionLabel': 'Описание',
    'createEvent.descriptionPlaceholder': 'О чём событие, кому будет интересно...',
    'createEvent.publish': 'Создать событие',

    // MyEventsScreen.js
    'myEvents.registered': 'Вы зарегистрированы',
    'myEvents.backLabel': 'Профиль',
    'myEvents.title': 'Мои события',
    'myEvents.subtitle': '{value} предстоящих мероприятий',
    'myEvents.createButton': 'Создать событие',
    'myEvents.emptyTitle': 'Нет регистраций',
    'myEvents.emptyText': 'Зарегистрируйтесь на события в разделе «Нетворкинг» или создайте своё',

    // ImmigrationScreen.js
    'immigration.openLink': 'Открыть →',
    'immigration.readMore': 'Подробнее →',
    'immigration.title': 'Иммиграция',
    'immigration.subtitle': 'Гид по иммиграции в США для соотечественников из СНГ',
    'immigration.searchPlaceholder': 'Поиск по визам, грин карте, гражданству...',
    'immigration.noResults': 'Ничего не найдено',

    // ImmigrationGuideScreen.js
    'immigrationGuide.backLabel': 'Иммиграция',
    'immigrationGuide.stepByStep': 'Пошагово',
    'immigrationGuide.tipLabel': '💡 Совет',

    // ResourcesScreen.js
    'resources.goTo': 'Перейти',
    'resources.title': 'Наша база',
    'resources.subtitle': 'Проверенные сервисы для русскоязычных иммигрантов в США',

    // AiChatScreen.js
    'aiChat.suggestion1': 'Какие визы подходят для работы в IT?',
    'aiChat.suggestion2': 'Как подать на грин-карту через работу?',
    'aiChat.suggestion3': 'Что такое PERM и сколько это занимает?',
    'aiChat.signInRequired': 'Войдите в аккаунт, чтобы отправлять сообщения.',
    'aiChat.responseError': 'Не удалось получить ответ. Проверьте API-ключ и подключение.',
    'aiChat.title': 'AI-помощник',
    'aiChat.subtitle': 'Универсальный помощник',
    'aiChat.emptyTitle': 'Задайте вопрос по иммиграции',
    'aiChat.emptyHint': 'Я помогу разобраться с визами, грин-картой, работой и адаптацией в США.',
    'aiChat.typing': 'AI печатает...',
    'aiChat.inputPlaceholder': 'Спросите про визы, грин-карту, работу...',

    // GlobalSearchScreen.js
    'search.placeholder': 'Поиск по всему приложению...',
    'search.hint': 'Введите запрос — вакансии, события, посты, визы, люди',
    'search.noResults': 'Ничего не найдено по запросу «{value}»',
    'search.resultsCount': '{value} результатов',
    'search.jobs': 'Работа',
    'search.events': 'События',
    'search.posts': 'Посты',
    'search.immigration': 'Иммиграция',
    'search.people': 'Люди',

    // ChecklistScreen.js
    'checklist.readMore': 'Подробнее →',
    'checklist.backLabel': 'Назад',
    'checklist.title': 'Чек-лист адаптации',
    'checklist.progress': '{done} из {total} выполнено · {progress}%',

    // NotificationsScreen.js
    'notifications.backLabel': 'Профиль',
    'notifications.title': 'Уведомления',
    'notifications.unreadCount': '{value} непрочитанных',
    'notifications.markAllRead': 'Прочитать все',

    // HelpScreen.js
    'help.backLabel': 'Профиль',
    'help.title': 'Помощь и поддержка',
    'help.subtitle': 'Частые вопросы о Vmeste',
    'help.notFound': 'Не нашли ответ?',
    'help.tapToWrite': 'Нажмите, чтобы написать',
    'help.faq1.q': 'Как найти работу в США?',
    'help.faq1.a': 'Используйте раздел «Работа» — там вакансии от компаний, открытых к кандидатам из СНГ. Обновляйте LinkedIn и готовьте резюме в американском формате.',
    'help.faq2.q': 'Где получить помощь с визой?',
    'help.faq2.a': 'Раздел «Иммиграция» содержит информацию о типах виз и ссылки на официальные ресурсы USCIS. Для сложных случаев рекомендуем accredited immigration attorney.',
    'help.faq3.q': 'Как познакомиться с соотечественниками?',
    'help.faq3.a': 'В «Нетворкинге» есть события, группы в Telegram/Discord и профили участников. Посещайте офлайн-встречи — это лучший способ завести связи.',
    'help.faq4.q': 'Безопасно ли делиться данными в приложении?',
    'help.faq4.a': 'Мы не передаём ваши данные третьим лицам. Не публикуйте номера документов и финансовую информацию в открытых разделах.',
    'help.faq5.q': 'Как связаться с поддержкой?',
    'help.faq5.a': 'Напишите нам на support@vmeste.app — отвечаем на русском и английском в течение 24 часов.',

    // EditProfileScreen.js
    'editProfile.selectStatus': 'Выберите статус',
    'editProfile.backLabel': 'Профиль',
    'editProfile.title': 'Редактировать профиль',
    'editProfile.coverPhotoLabel': 'Обложка профиля',
    'editProfile.yourName': 'Ваше имя',
    'editProfile.uploadCover': 'Загрузить обложку',
    'editProfile.removeCover': 'Удалить обложку',
    'editProfile.profilePhotoLabel': 'Фото профиля',
    'editProfile.uploadPhoto': 'Загрузить фото',
    'editProfile.remove': 'Удалить',
    'editProfile.nameLabel': 'Имя',
    'editProfile.professionLabel': 'Профессия',
    'editProfile.professionPlaceholder': 'Например: Software Engineer',
    'editProfile.cityLabel': 'Город',
    'editProfile.originCountryLabel': 'Страна происхождения',
    'editProfile.originCountryPlaceholder': 'Например: Россия, Украина, Казахстан',
    'editProfile.immigrationStatusLabel': 'Иммиграционный статус',
    'editProfile.bioLabel': 'О себе',
    'editProfile.interestsLabel': 'Интересы (через запятую)',
    'editProfile.linkedInLabel': 'LinkedIn',
    'editProfile.telegramLabel': 'Telegram',
    'editProfile.telegramPlaceholder': 'https://t.me/username или @username',
    'editProfile.save': 'Сохранить',

    // PhoneScreen.tsx
    'phoneAuth.errors.invalidPhoneNumber': 'Неверный формат номера телефона',
    'phoneAuth.errors.missingPhoneNumber': 'Введите номер телефона',
    'phoneAuth.errors.tooManyRequests': 'Слишком много попыток. Попробуйте позже',
    'phoneAuth.errors.quotaExceeded': 'Превышен лимит SMS. Попробуйте позже',
    'phoneAuth.errors.captchaCheckFailed': 'Проверка reCAPTCHA не пройдена',
    'phoneAuth.errors.invalidAppCredential': 'Ошибка конфигурации Firebase. Проверьте настройки',
    'phoneAuth.errors.generic': 'Не удалось отправить код. Попробуйте снова',
    'phoneAuth.backLink': '← Назад ко входу',
    'phoneAuth.title': 'Вход по телефону',
    'phoneAuth.subtitle': 'Введите номер — мы отправим SMS с кодом подтверждения',
    'phoneAuth.phoneNumberLabel': 'Номер телефона',
    'phoneAuth.hint': 'Выберите страну и введите номер без кода страны',
    'phoneAuth.sendCode': 'Отправить код',
    'phoneAuth.selectCountry': 'Выберите страну',
    'phoneAuth.close': 'Закрыть',
    'phoneAuth.cancel': 'Отмена',

    // VerifyScreen.tsx
    'verify.errors.invalidCode': 'Неверный код подтверждения',
    'verify.errors.codeExpired': 'Срок действия кода истёк. Запросите новый',
    'verify.errors.missingCode': 'Введите код из SMS',
    'verify.errors.sessionExpired': 'Сессия истекла. Запросите код заново',
    'verify.errors.generic': 'Не удалось подтвердить код. Попробуйте снова',
    'verify.errors.sessionNotFound': 'Сессия не найдена. Запросите код заново',
    'verify.errors.enterSixDigitCode': 'Введите 6-значный код из SMS',
    'verify.defaultUserName': 'Пользователь',
    'verify.changeNumber': '← Изменить номер',
    'verify.title': 'Код из SMS',
    'verify.codeSentToPrefix': 'Мы отправили код на',
    'verify.enterCodeFromSms': 'Введите код из SMS-сообщения',
    'verify.codeLabel': 'Код подтверждения',
    'verify.confirm': 'Подтвердить',

    // CheckEmailScreen.tsx
    'checkEmail.errors.notVerified': 'Email ещё не подтверждён. Откройте письмо и нажмите на ссылку.',
    'checkEmail.errors.checkFailed': 'Не удалось проверить статус. Попробуйте снова.',
    'checkEmail.backLink': '← Назад',
    'checkEmail.title': 'Проверьте почту',
    'checkEmail.subtitle': 'Мы отправили письмо на ваш email. Подтвердите его чтобы войти в приложение.',
    'checkEmail.confirmedButton': 'Я подтвердил email',

    // OnboardingOverlay.js
    'onboarding.start': 'Начать',
    'onboarding.next': 'Далее',
    'onboarding.skip': 'Пропустить',

    // ProfileSetupSheet.js
    'profileSetup.welcome': 'Добро пожаловать в Vmeste!',
    'profileSetup.subtitle': 'Расскажите немного о себе — так мы подберём полезные рекомендации',
    'profileSetup.cityLabel': 'Город в США',
    'profileSetup.cityPlaceholder': 'Например: Бруклин, Нью-Йорк',
    'profileSetup.interestsLabel': 'Интересы',
    'profileSetup.interests.it': 'IT',
    'profileSetup.interests.immigration': 'Иммиграция',
    'profileSetup.interests.entrepreneurship': 'Предпринимательство',
    'profileSetup.interests.networking': 'Нетворкинг',
    'profileSetup.interests.career': 'Карьера',
    'profileSetup.interests.lifeInUs': 'Жизнь в США',
    'profileSetup.continueButton': 'Продолжить',

    // App.js
    'app.blockUserError': 'Не удалось заблокировать пользователя. Попробуйте позже.',
    'app.unblockUserError': 'Не удалось разблокировать пользователя. Попробуйте позже.',
    'app.thanks': 'Спасибо',
    'app.reportSentMessage': 'Жалоба отправлена. Мы рассмотрим её в ближайшее время.',
    'app.signInToPostError': 'Войдите в аккаунт, чтобы публиковать пост.',
    'app.signInToCreateEventError': 'Войдите в аккаунт, чтобы создать событие.',
    'app.notAvailable': 'Недоступно',
    'app.editOwnPostsOnly': 'Редактировать можно только свои посты.',
    'app.deleteOwnPostsOnly': 'Удалять можно только свои посты.',
    'app.deletePostError': 'Не удалось удалить пост. Попробуйте позже.',
    'app.deletePostConfirmTitle': 'Удалить пост?',
    'app.deletePostConfirmMessage': 'Пост будет удалён без возможности восстановления.',
    'app.cancel': 'Отмена',
    'app.delete': 'Удалить',
    'app.feedByTopic': 'Посты по теме «{value}»',
  },
  en: {
    'tabBar.home': 'Home',
    'tabBar.jobs': 'Jobs',
    'tabBar.resources': 'Resources',
    'tabBar.immigration': 'Immigration',
    'tabBar.ai': 'AI',
    'tabBar.networking': 'Networking',
    'tabBar.profile': 'Profile',

    'backLabel.home': 'Home',
    'backLabel.jobs': 'Jobs',
    'backLabel.resources': 'Resources',
    'backLabel.immigration': 'Immigration',
    'backLabel.ai': 'AI',
    'backLabel.networking': 'Networking',
    'backLabel.profile': 'Profile',

    'home.title': 'Home',
    'home.composerPlaceholder': "What's on your mind?",
    'home.ownStoryLabel': 'Your story',
    'home.like': 'Like',
    'home.share': 'Share',

    'theme.system': 'System',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.title': 'Appearance',

    'profile.backLabel': 'Home',
    'profile.personalInfo': 'Personal info',
    'profile.from': 'From {value}',
    'profile.status': 'Status: {value}',
    'profile.memberSince': 'Member since {value}',
    'profile.connections': 'Connections',
    'profile.events': 'Events',
    'profile.posts': 'Posts',
    'profile.menu.edit': 'Edit profile',
    'profile.menu.feed': 'Community feed',
    'profile.menu.connections': 'My connections',
    'profile.menu.messages': 'Messages',
    'profile.menu.events': 'My events',
    'profile.menu.checklist': 'Adaptation checklist',
    'profile.menu.saved': 'Saved',
    'profile.menu.notifications': 'Notifications',
    'profile.menu.help': 'Help & support',
    'profile.menu.settings': 'Settings',

    'settings.title': 'Settings',
    'settings.backLabel': 'Profile',
    'settings.notifications': 'Notifications',
    'settings.pushTitle': 'Push notifications',
    'settings.pushDesc': 'New jobs and messages',
    'settings.emailDigestTitle': 'Email digest',
    'settings.emailDigestDesc': 'Weekly summary',
    'settings.eventRemindersTitle': 'Event reminders',
    'settings.language': 'Language',
    'settings.appLanguage': 'App language',
    'settings.account': 'Account',
    'settings.email': 'Email',
    'settings.changePassword': 'Change password',
    'settings.deleteAccount': 'Delete account',
    'settings.signOut': 'Sign out',
    'settings.version': 'Vmeste v1.0.0',
    'settings.signOutConfirmTitle': 'Sign out',
    'settings.signOutConfirmMessage': 'Are you sure you want to sign out?',
    'settings.cancel': 'Cancel',
    'settings.confirm': 'Sign out',
    'settings.signOutError': 'Failed to sign out. Please try again.',
    'settings.passwordResetSentTitle': 'Done',
    'settings.passwordResetSentMessage': 'A password reset link has been sent to your email',
    'settings.passwordResetError': 'Failed to send the email. Please try again later.',
    'settings.deleteAccountConfirmTitle': 'Delete account?',
    'settings.deleteAccountConfirmMessage':
      'Warning! This action cannot be undone. All your data (profile, posts, messages) will be deleted. Continue?',
    'settings.delete': 'Delete',
    'settings.enterPassword': 'Enter password',
    'settings.passwordPromptDesc': 'Enter your password to confirm account deletion',
    'settings.passwordPlaceholder': 'Password',
    'settings.passwordRequiredError': 'Enter your password to confirm',
    'settings.accountDeletedTitle': 'Account deleted',
    'settings.accountDeletedMessage': 'Your account has been successfully deleted.',
    'settings.ok': 'OK',
    'settings.error': 'Error',
    'settings.genericDeleteError': 'Failed to delete account. Check your password and try again.',

    'auth.tagline.login': 'A community for compatriots in the US',
    'auth.tagline.register': 'Create an account in a minute',
    'auth.login.title': 'Sign in',
    'auth.login.subtitle': "Sign in — we'll load your profile from the database",
    'auth.emailLabel': 'Email',
    'auth.passwordLabel': 'Password',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',
    'auth.login.submit': 'Sign in',
    'auth.login.phoneButton': '📱 Sign in with phone number',
    'auth.login.googleButton': 'Sign in with Google',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.noAccount': "Don't have an account? Sign up",
    'auth.register.title': 'Sign up',
    'auth.register.subtitle': 'After signing up your profile will be saved to the database',
    'auth.register.firstName': 'First name',
    'auth.register.firstNamePlaceholder': 'Mary',
    'auth.register.lastName': 'Last name',
    'auth.register.lastNamePlaceholder': 'Johnson',
    'auth.register.password': 'Password',
    'auth.register.confirmPassword': 'Confirm password',
    'auth.register.confirmPasswordPlaceholder': 'Repeat password',
    'auth.register.passwordPlaceholder': 'At least 6 characters',
    'auth.register.submit': 'Sign up',
    'auth.register.haveAccount': 'Already have an account? Sign in',
    'auth.errors.fillEmailPassword': 'Enter your email and password',
    'auth.errors.fillAllFields': 'Fill in all fields',
    'auth.errors.passwordTooShort': 'Password must be at least 6 characters',
    'auth.errors.passwordMismatch': 'Passwords do not match',
    'auth.errors.generic': 'Something went wrong. Please try again',
    'auth.errors.googleGeneric': 'Failed to sign in with Google. Please try again',
    'auth.errors.emailInUse': 'This email is already registered',
    'auth.errors.invalidEmail': 'Invalid email format',
    'auth.errors.userNotFound': 'User not found',
    'auth.errors.wrongPassword': 'Incorrect password',
    'auth.errors.invalidCredential': 'Incorrect email or password',
    'auth.errors.tooManyRequests': 'Too many attempts. Please try again later',
    'auth.errors.missingPassword': 'Enter your password',
    'auth.errors.accountExistsDifferentCredential':
      'An account with this email is already registered using a different method',
    'auth.errors.popupClosed': 'Sign-in cancelled',
    'auth.errors.emailNotVerified': 'Please verify your email before signing in. Check your inbox.',
    'auth.errors.enterEmail': 'Enter your email',

    'auth.forgotPassword.backLink': '← Back to sign in',
    'auth.forgotPassword.title': 'Reset password',
    'auth.forgotPassword.subtitle': "Enter your email — we'll send a link to restore access",
    'auth.forgotPassword.submit': 'Send link',
    'auth.forgotPassword.successMessage': 'A password reset link has been sent to your email',
    'auth.forgotPassword.backToLogin': 'Back to sign in',

    // FeedScreen.js
    'feed.backLabel': 'Home',
    'feed.title': 'Feed',
    'feed.subtitle': 'Posts from the community',
    'feed.writePost': 'Write a post',
    'feed.emptyTitle': 'No posts in this category',
    'feed.emptyText': 'Try a different filter or be the first to post',

    // PostDetailScreen.js
    'postDetail.back': 'Back',
    'postDetail.justNow': 'Just now',
    'postDetail.comments': 'Comments ({value})',
    'postDetail.beFirstComment': 'Be the first to leave a comment',
    'postDetail.commentPlaceholder': 'Write a comment...',
    'postDetail.send': 'Send',

    // CreatePostScreen.js
    'createPost.galleryPermissionError': 'Gallery access is needed to attach a photo',
    'createPost.addTextOrPhotoError': 'Add text or a photo',
    'createPost.saveError': 'Failed to save. Please try again.',
    'createPost.publishError': 'Failed to publish. Please try again.',
    'createPost.cancel': 'Cancel',
    'createPost.editTitle': 'Edit post',
    'createPost.newTitle': 'New post',
    'createPost.textLabel': 'Text',
    'createPost.textPlaceholder': 'Share something with the community...',
    'createPost.photoLabel': 'Photo',
    'createPost.removePhoto': 'Remove photo',
    'createPost.attachPhoto': 'Attach a photo',
    'createPost.categoryLabel': 'Category',
    'createPost.save': 'Save',
    'createPost.publish': 'Publish',

    // MyPostsScreen.js
    'myPosts.backLabel': 'Profile',
    'myPosts.title': 'My posts',
    'myPosts.postCountSingular': 'post',
    'myPosts.postCountPlural': 'posts',
    'myPosts.writePost': 'Write a post',
    'myPosts.emptyTitle': 'No posts yet',
    'myPosts.emptyText': 'Share your experience or ask the community a question',

    // PostOptionsMenu.js
    'postMenu.editPost': 'Edit post',
    'postMenu.deletePost': 'Delete post',
    'postMenu.report': 'Report',
    'postMenu.cancel': 'Cancel',

    // CapturablePostCard.js
    'postCard.downloadCta': 'Download on the App Store / Google Play',

    // ShareSheet.js
    'shareSheet.title': 'Share post',
    'shareSheet.cancel': 'Cancel',

    // ShareButtons.js
    'shareButtons.downloadCta': 'Download {value}: https://vmestegroup.app',
    'shareButtons.openAppErrorTitle': 'Could not open the app',
    'shareButtons.openAppErrorMessage': 'Check whether it is installed.',
    'shareButtons.noImageTitle': 'No image',
    'shareButtons.noImageMessage': '{value} only accepts images/video — capture the post first.',
    'shareButtons.sharingUnavailable': 'Sharing is not available on this device',
    'shareButtons.shareToInstagram': 'Share to Instagram',
    'shareButtons.shareToTikTok': 'Share to TikTok',

    // NetworkingScreen.js
    'networking.attendees': '{value} attendees',
    'networking.membersCount': '{value} members',
    'networking.join': 'Join',
    'networking.title': 'Networking',
    'networking.subtitle': 'Events, groups, and connections in the diaspora community',
    'networking.searchPlaceholder': 'Search events, groups, people...',
    'networking.noResults': 'Nothing found',
    'networking.upcomingEvents': 'Upcoming events',
    'networking.create': 'Create',
    'networking.communities': 'Communities',
    'networking.peopleNearYou': 'People near you',

    // ConnectionsScreen.js
    'connections.backLabel': 'Profile',
    'connections.title': 'My connections',
    'connections.peopleCount': '{value} people',
    'connections.emptyTitle': 'No connections yet',
    'connections.emptyText': 'Add people through the "Networking" section',

    // MemberDetailScreen.js
    'memberDetail.back': 'Back',
    'memberDetail.about': 'About',
    'memberDetail.interests': 'Interests',
    'memberDetail.userBlocked': 'User blocked',
    'memberDetail.unblock': 'Unblock',
    'memberDetail.inYourConnections': 'In your connections',
    'memberDetail.sendMessage': 'Send message',
    'memberDetail.addToConnections': 'Add to connections',
    'memberDetail.mutualConnections': 'Mutual connections ({value})',
    'memberDetail.posts': 'Posts',
    'memberDetail.noPosts': 'No posts yet',

    // MessagesScreen.js
    'messages.defaultUserName': 'User',
    'messages.startConversation': 'Start a conversation',
    'messages.backLabel': 'Profile',
    'messages.errorTitle': 'Error',
    'messages.deleteConversationError': 'Failed to delete the conversation. Please try again later.',
    'messages.deleteConversationConfirmTitle': 'Delete conversation?',
    'messages.deleteConversationConfirmMessage': 'This cannot be undone.',
    'messages.cancel': 'Cancel',
    'messages.delete': 'Delete',
    'messages.title': 'Messages',
    'messages.conversationsCount': '{value} conversations',
    'messages.chooseFriend': 'Choose a friend',
    'messages.emptyTitle': 'No messages yet',
    'messages.signInToMessage': 'Sign in to send and receive messages',
    'messages.addFriendsToStart': 'Add friends in the "Networking" section to start chatting',

    // ChatScreen.js
    'chat.openChatError': 'Failed to open the chat. Please try again.',
    'chat.chatLoadingError': 'The chat is still loading. Wait a second and try again.',
    'chat.sendMessageError': 'Failed to send the message. Please try again.',
    'chat.writeFirstMessage': 'Write the first message',
    'chat.messagePlaceholder': 'Message...',

    // MemberOptionsMenu.js
    'memberMenu.report': 'Report user',
    'memberMenu.block': 'Block',
    'memberMenu.unblock': 'Unblock',
    'memberMenu.cancel': 'Cancel',

    // JobsScreen.js
    'jobs.title': 'Jobs',
    'jobs.subtitle': '{value} jobs for our community',
    'jobs.searchPlaceholder': 'Search by title, company, city...',
    'jobs.empty': 'No results found',

    // JobDetailScreen.js
    'jobDetail.back': 'Back',
    'jobDetail.linkUnavailableTitle': 'Link unavailable',
    'jobDetail.linkUnavailableMessage': "This job doesn't have an application link yet.",
    'jobDetail.linkOpenFailedTitle': 'Failed to open the link',
    'jobDetail.tryAgainLater': 'Please try again later.',
    'jobDetail.city': 'City',
    'jobDetail.salary': 'Salary',
    'jobDetail.description': 'Description',
    'jobDetail.requirements': 'Requirements',
    'jobDetail.apply': 'Apply',

    // SavedJobsScreen.js
    'savedJobs.backLabel': 'Profile',
    'savedJobs.title': 'Saved',
    'savedJobs.subtitle': '{value} saved jobs',
    'savedJobs.emptyTitle': 'Nothing here yet',
    'savedJobs.emptyText': 'Save jobs you like by tapping the bookmark',

    // EventDetailScreen.js
    'eventDetail.back': 'Back',
    'eventDetail.organizer': 'Organizer: {value}',
    'eventDetail.city': 'City',
    'eventDetail.venue': 'Venue',
    'eventDetail.attendeesLabel': 'Attendees',
    'eventDetail.attendeesValue': '{value} people',
    'eventDetail.about': 'About the event',
    'eventDetail.agenda': 'Agenda',
    'eventDetail.registered': "You're registered!",
    'eventDetail.register': 'Register',

    // CreateEventScreen.js
    'createEvent.errorRequiredFields': 'Fill in the title, date, and city',
    'createEvent.errorGeneric': 'Failed to create the event. Please try again.',
    'createEvent.cancel': 'Cancel',
    'createEvent.newEvent': 'New event',
    'createEvent.titleLabel': 'Title',
    'createEvent.titlePlaceholder': 'E.g.: CIS entrepreneurs meetup',
    'createEvent.dateLabel': 'Date and time',
    'createEvent.datePlaceholder': 'E.g.: July 12 · 6:00 PM',
    'createEvent.cityLabel': 'City',
    'createEvent.cityPlaceholder': 'E.g.: New York',
    'createEvent.venueLabel': 'Venue',
    'createEvent.venuePlaceholder': 'E.g.: Central Park, Sheep Meadow',
    'createEvent.descriptionLabel': 'Description',
    'createEvent.descriptionPlaceholder': 'What the event is about, who might be interested...',
    'createEvent.publish': 'Create event',

    // MyEventsScreen.js
    'myEvents.registered': "You're registered",
    'myEvents.backLabel': 'Profile',
    'myEvents.title': 'My events',
    'myEvents.subtitle': '{value} upcoming events',
    'myEvents.createButton': 'Create event',
    'myEvents.emptyTitle': 'No registrations',
    'myEvents.emptyText': 'Register for events in the "Networking" section or create your own',

    // ImmigrationScreen.js
    'immigration.openLink': 'Open →',
    'immigration.readMore': 'Read more →',
    'immigration.title': 'Immigration',
    'immigration.subtitle': 'A guide to US immigration for compatriots from the CIS',
    'immigration.searchPlaceholder': 'Search visas, green card, citizenship...',
    'immigration.noResults': 'Nothing found',

    // ImmigrationGuideScreen.js
    'immigrationGuide.backLabel': 'Immigration',
    'immigrationGuide.stepByStep': 'Step by step',
    'immigrationGuide.tipLabel': '💡 Tip',

    // ResourcesScreen.js
    'resources.goTo': 'Go to',
    'resources.title': 'Resources',
    'resources.subtitle': 'Trusted services for Russian-speaking immigrants in the US',

    // AiChatScreen.js
    'aiChat.suggestion1': 'Which visas work for an IT job?',
    'aiChat.suggestion2': 'How do I apply for a green card through employment?',
    'aiChat.suggestion3': 'What is PERM and how long does it take?',
    'aiChat.signInRequired': 'Sign in to send messages.',
    'aiChat.responseError': 'Failed to get a response. Check your API key and connection.',
    'aiChat.title': 'AI assistant',
    'aiChat.subtitle': 'Universal assistant',
    'aiChat.emptyTitle': 'Ask an immigration question',
    'aiChat.emptyHint': "I'll help you with visas, green cards, work, and adapting to life in the US.",
    'aiChat.typing': 'AI is typing...',
    'aiChat.inputPlaceholder': 'Ask about visas, green card, work...',

    // GlobalSearchScreen.js
    'search.placeholder': 'Search the whole app...',
    'search.hint': 'Type a query — jobs, events, posts, visas, people',
    'search.noResults': 'No results for "{value}"',
    'search.resultsCount': '{value} results',
    'search.jobs': 'Jobs',
    'search.events': 'Events',
    'search.posts': 'Posts',
    'search.immigration': 'Immigration',
    'search.people': 'People',

    // ChecklistScreen.js
    'checklist.readMore': 'Read more →',
    'checklist.backLabel': 'Back',
    'checklist.title': 'Adaptation checklist',
    'checklist.progress': '{done} of {total} done · {progress}%',

    // NotificationsScreen.js
    'notifications.backLabel': 'Profile',
    'notifications.title': 'Notifications',
    'notifications.unreadCount': '{value} unread',
    'notifications.markAllRead': 'Mark all as read',

    // HelpScreen.js
    'help.backLabel': 'Profile',
    'help.title': 'Help & support',
    'help.subtitle': 'Frequently asked questions about Vmeste',
    'help.notFound': "Didn't find an answer?",
    'help.tapToWrite': 'Tap to write to us',
    'help.faq1.q': 'How do I find a job in the US?',
    'help.faq1.a': 'Use the "Jobs" section — it lists openings from companies open to candidates from the CIS. Keep your LinkedIn updated and prepare a US-style resume.',
    'help.faq2.q': 'Where can I get help with a visa?',
    'help.faq2.a': 'The "Immigration" section has information on visa types and links to official USCIS resources. For complex cases, we recommend an accredited immigration attorney.',
    'help.faq3.q': 'How do I meet other compatriots?',
    'help.faq3.a': '"Networking" has events, Telegram/Discord groups, and member profiles. Attend in-person meetups — it\'s the best way to make connections.',
    'help.faq4.q': 'Is it safe to share data in the app?',
    'help.faq4.a': "We don't share your data with third parties. Don't post document numbers or financial information in public sections.",
    'help.faq5.q': 'How do I contact support?',
    'help.faq5.a': 'Email us at support@vmeste.app — we reply in Russian and English within 24 hours.',

    // EditProfileScreen.js
    'editProfile.selectStatus': 'Select status',
    'editProfile.backLabel': 'Profile',
    'editProfile.title': 'Edit profile',
    'editProfile.coverPhotoLabel': 'Profile cover photo',
    'editProfile.yourName': 'Your name',
    'editProfile.uploadCover': 'Upload cover photo',
    'editProfile.removeCover': 'Remove cover photo',
    'editProfile.profilePhotoLabel': 'Profile photo',
    'editProfile.uploadPhoto': 'Upload photo',
    'editProfile.remove': 'Remove',
    'editProfile.nameLabel': 'Name',
    'editProfile.professionLabel': 'Profession',
    'editProfile.professionPlaceholder': 'E.g.: Software Engineer',
    'editProfile.cityLabel': 'City',
    'editProfile.originCountryLabel': 'Country of origin',
    'editProfile.originCountryPlaceholder': 'E.g.: Russia, Ukraine, Kazakhstan',
    'editProfile.immigrationStatusLabel': 'Immigration status',
    'editProfile.bioLabel': 'About',
    'editProfile.interestsLabel': 'Interests (comma-separated)',
    'editProfile.linkedInLabel': 'LinkedIn',
    'editProfile.telegramLabel': 'Telegram',
    'editProfile.telegramPlaceholder': 'https://t.me/username or @username',
    'editProfile.save': 'Save',

    // PhoneScreen.tsx
    'phoneAuth.errors.invalidPhoneNumber': 'Invalid phone number format',
    'phoneAuth.errors.missingPhoneNumber': 'Enter your phone number',
    'phoneAuth.errors.tooManyRequests': 'Too many attempts. Please try again later',
    'phoneAuth.errors.quotaExceeded': 'SMS limit exceeded. Please try again later',
    'phoneAuth.errors.captchaCheckFailed': 'reCAPTCHA verification failed',
    'phoneAuth.errors.invalidAppCredential': 'Firebase configuration error. Check your settings',
    'phoneAuth.errors.generic': 'Failed to send the code. Please try again',
    'phoneAuth.backLink': '← Back to sign in',
    'phoneAuth.title': 'Sign in with phone',
    'phoneAuth.subtitle': "Enter your number — we'll send an SMS with a verification code",
    'phoneAuth.phoneNumberLabel': 'Phone number',
    'phoneAuth.hint': 'Choose your country and enter the number without the country code',
    'phoneAuth.sendCode': 'Send code',
    'phoneAuth.selectCountry': 'Select country',
    'phoneAuth.close': 'Close',
    'phoneAuth.cancel': 'Cancel',

    // VerifyScreen.tsx
    'verify.errors.invalidCode': 'Incorrect verification code',
    'verify.errors.codeExpired': 'The code has expired. Request a new one',
    'verify.errors.missingCode': 'Enter the code from the SMS',
    'verify.errors.sessionExpired': 'Session expired. Request the code again',
    'verify.errors.generic': 'Failed to verify the code. Please try again',
    'verify.errors.sessionNotFound': 'Session not found. Request the code again',
    'verify.errors.enterSixDigitCode': 'Enter the 6-digit code from the SMS',
    'verify.defaultUserName': 'User',
    'verify.changeNumber': '← Change number',
    'verify.title': 'SMS code',
    'verify.codeSentToPrefix': 'We sent a code to',
    'verify.enterCodeFromSms': 'Enter the code from the SMS message',
    'verify.codeLabel': 'Verification code',
    'verify.confirm': 'Confirm',

    // CheckEmailScreen.tsx
    'checkEmail.errors.notVerified': 'Your email is not verified yet. Open the email and click the link.',
    'checkEmail.errors.checkFailed': 'Failed to check the status. Please try again.',
    'checkEmail.backLink': '← Back',
    'checkEmail.title': 'Check your email',
    'checkEmail.subtitle': "We've sent an email to your address. Confirm it to sign in to the app.",
    'checkEmail.confirmedButton': "I've confirmed my email",

    // OnboardingOverlay.js
    'onboarding.start': 'Get started',
    'onboarding.next': 'Next',
    'onboarding.skip': 'Skip',

    // ProfileSetupSheet.js
    'profileSetup.welcome': 'Welcome to Vmeste!',
    'profileSetup.subtitle': 'Tell us a bit about yourself — so we can suggest useful recommendations',
    'profileSetup.cityLabel': 'City in the US',
    'profileSetup.cityPlaceholder': 'E.g.: Brooklyn, New York',
    'profileSetup.interestsLabel': 'Interests',
    'profileSetup.interests.it': 'IT',
    'profileSetup.interests.immigration': 'Immigration',
    'profileSetup.interests.entrepreneurship': 'Entrepreneurship',
    'profileSetup.interests.networking': 'Networking',
    'profileSetup.interests.career': 'Career',
    'profileSetup.interests.lifeInUs': 'Life in the US',
    'profileSetup.continueButton': 'Continue',

    // App.js
    'app.blockUserError': 'Failed to block the user. Please try again later.',
    'app.unblockUserError': 'Failed to unblock the user. Please try again later.',
    'app.thanks': 'Thank you',
    'app.reportSentMessage': "Your report has been sent. We'll review it shortly.",
    'app.signInToPostError': 'Sign in to publish a post.',
    'app.signInToCreateEventError': 'Sign in to create an event.',
    'app.notAvailable': 'Not available',
    'app.editOwnPostsOnly': 'You can only edit your own posts.',
    'app.deleteOwnPostsOnly': 'You can only delete your own posts.',
    'app.deletePostError': 'Failed to delete the post. Please try again later.',
    'app.deletePostConfirmTitle': 'Delete post?',
    'app.deletePostConfirmMessage': 'This cannot be undone.',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.feedByTopic': 'Posts about "{value}"',
  },
};

const I18nContext = createContext({
  language: 'ru',
  setLanguage: async () => {},
  t: (key, params) => key,
  ready: false,
});

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState('ru');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (stored && TRANSLATIONS[stored]) {
          setLanguageState(stored);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const setLanguage = async (nextLanguage) => {
    setLanguageState(nextLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // storage unavailable during dev
    }
  };

  const t = useMemo(() => {
    const dict = TRANSLATIONS[language] ?? TRANSLATIONS.ru;
    return (key, params) => {
      const template = dict[key] ?? TRANSLATIONS.ru[key] ?? key;
      if (!params) return template;
      return Object.keys(params).reduce(
        (result, paramKey) => result.replace(`{${paramKey}}`, params[paramKey]),
        template,
      );
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, ready }),
    [language, ready, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
