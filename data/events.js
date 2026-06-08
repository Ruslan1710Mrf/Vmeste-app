export const EVENTS = [
  {
    id: '1',
    title: 'Встреча предпринимателей СНГ',
    date: '15 июня · 18:00',
    city: 'Нью-Йорк',
    venue: 'WeWork Bryant Park, Manhattan',
    attendees: 42,
    description:
      'Ежемесячная встреча основателей и предпринимателей из стран СНГ, живущих в США. Обмен опытом, питч-сессии и нетворкинг за кофе.',
    agenda: [
      '18:00 — Регистрация и welcome coffee',
      '18:30 — Панель: «Первый бизнес в США»',
      '19:30 — Lightning talks (5 мин)',
      '20:15 — Свободный нетворкинг',
    ],
    host: 'Vmeste NYC',
  },
  {
    id: '2',
    title: 'IT-митап: карьера в США',
    date: '22 июня · 19:30',
    city: 'Сан-Франциско',
    venue: 'Galvanize SF, SOMA',
    attendees: 68,
    description:
      'Митап для инженеров и IT-специалистов из СНГ. Разбор резюме, подготовка к интервью в Big Tech и стартапах Кремниевой долины.',
    agenda: [
      '19:30 — Нетворкинг',
      '20:00 — Доклад: «System Design на интервью»',
      '20:45 — Q&A с инженерами из Meta и Google',
      '21:30 — Afterparty',
    ],
    host: 'Vmeste Bay Area',
  },
  {
    id: '3',
    title: 'Кофе и нетворкинг',
    date: '28 июня · 10:00',
    city: 'Майами',
    venue: 'Panther Coffee, Wynwood',
    attendees: 24,
    description:
      'Неформальная утренняя встреча для новоприбывших и давно живущих в Miami. Помощь с адаптацией, рекомендации по районам и документам.',
    agenda: [
      '10:00 — Знакомство за кофе',
      '10:30 — Мини-группы по интересам',
      '11:30 — Свободное общение',
    ],
    host: 'Vmeste Miami',
  },
];

export function getEventById(id) {
  return EVENTS.find((event) => event.id === id);
}
