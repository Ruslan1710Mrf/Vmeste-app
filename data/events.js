export const EVENTS = [
  {
    id: '1',
    title: 'Летняя встреча казахов Нью-Йорка',
    date: '7 июня · 15:00',
    city: 'Нью-Йорк',
    venue: 'Sheep Meadow, Central Park',
    attendees: 85,
    description:
      'Ежегодный пикник Kazakh Community of New York: знакомства, национальные блюда, детская зона и консультации по жизни в США для недавно приехавших из Казахстана.',
    agenda: [
      '15:00 — Сбор и регистрация',
      '15:30 — Приветствие и знакомство в кругах',
      '16:30 — Мастер-класс: «Документы и работа в NY»',
      '17:30 — Свободное общение и фото',
    ],
    host: 'Kazakh Community of New York',
  },
  {
    id: '2',
    title: 'Русскоязычный IT-митап',
    date: '14 июня · 18:30',
    city: 'Лос-Анджелес',
    venue: 'Cross Campus, Santa Monica',
    attendees: 62,
    description:
      'Ежемесячный митап инженеров и продактов из России, Украины и Беларуси. Разбор резюме, mock-интервью и нетворкинг с сотрудниками Snap, Netflix и местных стартапов.',
    agenda: [
      '18:30 — Регистрация и нетворкинг',
      '19:00 — Доклад: «Как пройти technical screen»',
      '19:45 — Панель с инженерами из FAANG',
      '20:30 — Afterparty на пляже Santa Monica',
    ],
    host: 'Russian Tech LA',
  },
  {
    id: '3',
    title: 'Карьерная ярмарка CIS Professionals',
    date: '21 июня · 17:00',
    city: 'Остин',
    venue: 'Capital Factory, Downtown Austin',
    attendees: 120,
    description:
      'Ярмарка вакансий для русскоязычных специалистов в Техасе: IT, строительство, медицина, логистика. Работодатели с H-1B sponsorship, review резюме и LinkedIn на месте.',
    agenda: [
      '17:00 — Открытие и welcome speech',
      '17:30 — Стенды работодателей',
      '18:30 — Воркшоп: «Резюме для американского рынка»',
      '19:30 — Speed networking',
    ],
    host: 'CIS Professionals Austin',
  },
  {
    id: '4',
    title: 'Русский языковой клуб',
    date: '28 июня · 11:00',
    city: 'Майами',
    venue: 'Books & Books, Coral Gables',
    attendees: 28,
    description:
      'Еженедельный разговорный клуб для всех уровней: практика русского, обсуждение книг и фильмов, знакомство с русскоязычным сообществом Miami-Dade и Broward.',
    agenda: [
      '11:00 — Кофе и знакомство',
      '11:30 — Обсуждение книги месяца',
      '12:15 — Разговорные мини-группы по уровням',
      '13:00 — Свободное общение',
    ],
    host: 'Russian Language Club Miami',
  },
  {
    id: '5',
    title: 'Бизнес-завтрак предпринимателей СНГ',
    date: '5 июля · 08:30',
    city: 'Чикаго',
    venue: '1871, Merchandise Mart',
    attendees: 45,
    description:
      'Утренний нетворкинг для основателей и фрилансеров из стран СНГ в Чикаго. Обмен контактами, поиск партнёров и менторство от предпринимателей с опытом в США 10+ лет.',
    agenda: [
      '08:30 — Регистрация и завтрак',
      '09:00 — Lightning talks (3 × 10 мин)',
      '09:45 — Мастермайнд в группах',
      '10:30 — Свободный нетворкинг',
    ],
    host: 'Chicago Slavic Business Network',
  },
  {
    id: '6',
    title: 'Семейный пикник русскоязычных',
    date: '12 июля · 12:00',
    city: 'Нью-Йорк',
    venue: 'Prospect Park, Brooklyn (Grand Army Plaza)',
    attendees: 150,
    description:
      'Большой летний пикник для семей из Brooklyn, Queens и Staten Island: спорт, детские игры, благотворительный сбор и знакомство с локальными русскоязычными организациями.',
    agenda: [
      '12:00 — Сбор и размещение на лужайке',
      '12:30 — Детская программа и волейбол',
      '14:00 — Концерт и ярмарка некоммерческих организаций',
      '16:00 — Закрытие и group photo',
    ],
    host: 'RusRek NYC',
  },
];

export function getEventById(id, events = EVENTS) {
  return events.find((event) => event.id === id);
}
