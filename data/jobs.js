export const JOBS = [
  {
    id: '1',
    title: 'Frontend-разработчик',
    company: 'Meta',
    city: 'Менло-Парк, CA',
    salary: '$150 000 – $180 000',
    type: 'Полная занятость',
    posted: '3 дня назад',
    description:
      'Ищем frontend-разработчика для команды, работающей над продуктами для глобальной аудитории. Гибкий график, релокационный пакет для кандидатов с H-1B.',
    requirements: [
      '3+ года опыта с React / React Native',
      'Опыт работы в продуктовых командах',
      'Английский B2+',
      'Право на работу в США или готовность к спонсорству H-1B',
    ],
  },
  {
    id: '2',
    title: 'Медсестра (RN)',
    company: 'Mount Sinai Hospital',
    city: 'Нью-Йорк, NY',
    salary: '$85 000 – $95 000',
    type: 'Полная занятость',
    posted: '1 день назад',
    description:
      'Госпиталь в Manhattan ищет registered nurse. Помощь с лицензией NCLEX и адаптацией для специалистов из-за рубежа.',
    requirements: [
      'Диплом медсестры + NCLEX или готовность сдать',
      'Опыт от 2 лет',
      'Русский язык — преимущество',
    ],
  },
  {
    id: '3',
    title: 'Бухгалтер',
    company: 'Deloitte',
    city: 'Чикаго, IL',
    salary: '$70 000 – $85 000',
    type: 'Полная занятость',
    posted: '5 дней назад',
    description:
      'Команда налогового консалтинга. Работа с клиентами из СНГ, ведение отчётности, подготовка к CPA.',
    requirements: [
      'Бухгалтерское образование',
      'Знание US GAAP',
      'Excel / QuickBooks',
      'CPA или в процессе получения',
    ],
  },
  {
    id: '4',
    title: 'Маркетолог',
    company: 'Diaspora Media',
    city: 'Остин, TX',
    salary: '$90 000 – $110 000',
    type: 'Полная занятость',
    posted: '2 дня назад',
    description:
      'Маркетинг для медиа-платформы, ориентированной на русскоязычную аудиторию в США. SMM, контент, partnerships.',
    requirements: [
      'Опыт digital-маркетинга от 3 лет',
      'Понимание аудитории СНГ в США',
      'Meta Ads, Google Analytics',
    ],
  },
  {
    id: '5',
    title: 'IT Support Specialist',
    company: 'Amazon',
    city: 'Сиэтл, WA',
    salary: '$55 000 – $65 000',
    type: 'Полная занятость',
    posted: '1 неделю назад',
    description:
      'Техническая поддержка внутренних систем. Отличная точка входа в IT-карьеру в США для специалистов с опытом из СНГ.',
    requirements: [
      'Опыт IT support от 1 года',
      'Базовые знания сетей и Windows/macOS',
      'Коммуникабельность',
    ],
  },
  {
    id: '6',
    title: 'Учитель русского языка',
    company: 'NYC Department of Education',
    city: 'Нью-Йорк, NY',
    salary: '$65 000 – $78 000',
    type: 'Полная занятость',
    posted: '4 дня назад',
    description:
      'Преподавание русского языка в публичной школе. Программа для heritage speakers, подготовка к Regents.',
    requirements: [
      'Педагогическое образование',
      'Сертификация штата NY (или готовность получить)',
      'Носитель или near-native русский',
    ],
  },
  {
    id: '7',
    title: 'Шеф-повар',
    company: 'Restaurant Tatiana',
    city: 'Brighton Beach, NY',
    salary: '$50 000 + чаевые',
    type: 'Полная занятость',
    posted: '6 дней назад',
    description:
      'Легендарный ресторан в Brighton Beach ищет шеф-повара со знанием русской и европейской кухни.',
    requirements: [
      'Опыт на кухне от 5 лет',
      'Знание русской классической кухни',
      'Food Handler Certificate',
    ],
  },
  {
    id: '8',
    title: 'Водитель (Uber / Lyft)',
    company: 'Самозанятость',
    city: 'Лос-Анджелес, CA',
    salary: '~$3 500 / мес',
    type: 'Гибкий график',
    posted: 'Сегодня',
    description:
      'Популярный старт для новоприбывших. Гибкий график, не требует perfect English. Нужны права штата CA и свой автомобиль.',
    requirements: [
      'Водительские права штата CA',
      'Автомобиль 2015 года или новее',
      'Чистая driving record',
    ],
  },
];

export function getJobById(id) {
  return JOBS.find((job) => job.id === id);
}
