const SEED_THREADS = {
  '1': [
    { id: '1', from: 'them', text: 'Привет! Видела ваш пост про NCLEX — могу поделиться материалами.', time: '2026-06-06T10:00:00.000Z' },
    { id: '2', from: 'me', text: 'Здравствуйте! Буду очень благодарна 🙏', time: '2026-06-06T10:05:00.000Z' },
    { id: '3', from: 'them', text: 'Спасибо за совет по резюме!', time: '2026-06-07T10:30:00.000Z' },
  ],
  '2': [
    { id: '1', from: 'them', text: 'Привет! Интересно обсудить идею стартапа.', time: '2026-06-05T14:00:00.000Z' },
    { id: '2', from: 'me', text: 'Конечно! Расскажите подробнее.', time: '2026-06-05T14:10:00.000Z' },
    { id: '3', from: 'them', text: 'Давай созвонимся на следующей неделе', time: '2026-06-06T18:00:00.000Z' },
  ],
  '3': [
    { id: '1', from: 'me', text: 'Добрый день! Нужна консультация по H-1B.', time: '2026-06-04T09:00:00.000Z' },
    { id: '2', from: 'them', text: 'Отправила список документов на email.', time: '2026-06-04T11:00:00.000Z' },
  ],
  '4': [
    { id: '1', from: 'them', text: 'Полезный митап, был рад познакомиться!', time: '2026-06-03T20:00:00.000Z' },
  ],
};

export const DEFAULT_SETTINGS = {
  pushEnabled: true,
  emailDigest: false,
  eventReminders: true,
  language: 'ru',
};

export const LANGUAGES = [
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

export function mergeChatThreads(saved, connectedIds = []) {
  if (saved !== null && saved !== undefined) {
    return saved;
  }
  const seeded = {};
  connectedIds.forEach((id) => {
    if (SEED_THREADS[id]) {
      seeded[id] = SEED_THREADS[id];
    }
  });
  return seeded;
}

export function getThreadMessages(chatThreads, memberId) {
  return chatThreads[memberId] ?? [];
}

export function formatChatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getConversationPreview(messages) {
  if (!messages?.length) {
    return { preview: 'Начните переписку', time: 'Сейчас', sortKey: 0 };
  }
  const last = messages[messages.length - 1];
  return {
    preview: last.text,
    time: formatChatTime(last.time),
    sortKey: new Date(last.time || 0).getTime(),
  };
}

export function countActiveConversations(chatThreads, connectedIds = []) {
  return connectedIds.filter((id) => chatThreads[id]?.length > 0).length;
}
