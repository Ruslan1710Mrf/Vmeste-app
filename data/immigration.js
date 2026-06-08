export const IMMIGRATION_SECTIONS = [
  {
    id: 'visas',
    title: 'Визы',
    emoji: '🛂',
    color: '#2563EB',
    items: [
      {
        title: 'B-1 / B-2',
        description: 'Туристическая и деловая виза для краткосрочных поездок в США.',
        steps: [
          'Заполните форму DS-160 на ceac.state.gov',
          'Оплатите сбор MRV ($185)',
          'Запишитесь на собеседование в посольстве/консульстве',
          'Подготовьте документы: паспорт, фото, подтверждение связей с родиной',
        ],
        tip: 'Честно отвечайте на вопросы консула — главное доказать, что вернётесь домой.',
      },
      {
        title: 'F-1',
        description: 'Студенческая виза для обучения в аккредитованных учебных заведениях.',
        steps: [
          'Получите I-20 от учебного заведения (SEVP-approved)',
          'Оплатите SEVIS fee ($350)',
          'Заполните DS-160 и запишитесь на интервью',
          'На собеседовании покажите финансовую состоятельность',
        ],
        tip: 'F-1 не даёт права работать off-campus без разрешения (CPT/OPT).',
      },
      {
        title: 'H-1B',
        description: 'Рабочая виза для специалистов с высшим образованием. Лимитированная квота.',
        steps: [
          'Найдите работодателя-спонсора с E-Verify',
          'Работодатель подаёт LCA и регистрацию в H-1B lottery (март)',
          'При выигрыше — petition I-129 до 1 октября',
          'После одобрения — собеседование или change of status',
        ],
        tip: 'Cap season начинается 1 марта. Подготовьте дiploma evaluation заранее.',
      },
      {
        title: 'L-1',
        description: 'Перевод внутри компании для менеджеров и специалистов с опытом от 1 года.',
        steps: [
          'Работайте в филиале компании за рубежом минимум 1 год',
          'Компания подаёт I-129 с доказательством связи между офисами',
          'L-1A для менеджеров, L-1B для специалистов',
        ],
        tip: 'L-1 — хорошая альтернатива H-1B без lottery.',
      },
      {
        title: 'O-1',
        description: 'Виза для людей с выдающимися способностями в науке, искусстве или бизнесе.',
        steps: [
          'Соберите доказательства: публикации, награды, высокая зарплата, экспертные письма',
          'Работодатель или агент подаёт I-129',
          'USCIS оценивает по 8 критериям (нужно 3+)',
        ],
        tip: 'Подходит для IT-специалистов с open source, патентами или senior roles.',
      },
      {
        title: 'K-1',
        description: 'Виза невесты/жениха гражданина США для вступления в брак в течение 90 дней.',
        steps: [
          'Гражданин США подаёт I-129F',
          'После одобрения — собеседование в консульстве',
          'Въезд в США и регистрация брака в течение 90 дней',
          'Подача I-485 для грин карты',
        ],
        tip: 'Между одобрением I-129F и въездом действует ограничение по срокам — следите за датами.',
      },
    ],
  },
  {
    id: 'green-card',
    title: 'Грин карта',
    emoji: '🟢',
    color: '#059669',
    items: [
      {
        title: 'Лотерея DV (Diversity Visa)',
        description: 'Ежегодная бесплатная лотерея для граждан стран с низким уровнем иммиграции в США.',
        steps: [
          'Регистрация на dvprogram.state.gov (октябрь–ноябрь)',
          'Фото строго по спецификации (600×600 px, белый фон)',
          'Проверка результата в мае следующего года',
          'При выигрыше — подача DS-260 и прохождение interview',
        ],
        tip: 'Регистрация бесплатна. Остерегайтесь мошенников, предлагающих «гарантированный» выигрыш.',
      },
      {
        title: 'Семейная иммиграция',
        description: 'Подача через супруга, родителей, детей или братьев/сестёр — граждан США или LPR.',
        steps: [
          'Спонсор подаёт I-130 (Petition for Alien Relative)',
          'Ожидание visa bulletin (priority date)',
          'DS-260 или I-485 в зависимости от локации',
          'Medical exam и interview',
        ],
        tip: 'Сроки сильно зависят от категории: для супругов граждан США — быстрее всего.',
      },
      {
        title: 'Employment-based (EB-1, EB-2, EB-3)',
        description: 'Грин карта через работодателя: для выдающихся специалистов, профессионалов и квалифицированных работников.',
        steps: [
          'PERM labor certification (для EB-2/EB-3, ~6–12 мес)',
          'I-140 Immigrant Petition',
          'Ожидание priority date в visa bulletin',
          'I-485 или consular processing',
        ],
        tip: 'EB-1 не требует PERM — быстрее для qualified candidates.',
      },
      {
        title: 'EB-5 — инвесторская',
        description: 'Постоянный статус при инвестициях от $800 000 в проекты, создающие рабочие места.',
        steps: [
          'Выбор проекта через Regional Center или direct investment',
          'Инвестиция $800 000 (TEA) или $1 050 000',
          'I-526E petition',
          'Conditional green card → I-829 через 2 года',
        ],
        tip: 'Тщательно проверяйте track record Regional Center — риск потери инвестиций.',
      },
      {
        title: 'Adjustment of Status (I-485)',
        description: 'Смена статуса на постоянный резидент, если вы уже находитесь на территории США.',
        steps: [
          'Проверьте eligibility (approved I-130/I-140, visa availability)',
          'Подайте I-485 + I-765 (work permit) + I-131 (travel)',
          'Biometrics appointment',
          'Interview (если требуется)',
        ],
        tip: 'После подачи I-485 можно получить EAD и advance parole для работы и поездок.',
      },
    ],
  },
  {
    id: 'citizenship',
    title: 'Гражданство',
    emoji: '🇺🇸',
    color: '#7C3AED',
    items: [
      {
        title: 'Требования к натурализации',
        description: 'Минимум 5 лет с грин картой (3 года, если состоите в браке с гражданином США).',
        steps: [
          '5 лет continuous residence (3 для marriage-based)',
          'Физическое присутствие: 30 ме months из 5 лет',
          'Good moral character',
          'Базовый английский и знание civics',
        ],
        tip: 'Поездки за 6+ months могут прервать continuous residence — консультируйтесь с адвокатом.',
      },
      {
        title: 'Форма N-400',
        description: 'Основная заявка на гражданство. Подаётся онлайн через личный кабинет USCIS.',
        steps: [
          'Создайте аккаунт на myuscis.gov',
          'Заполните N-400 (Application for Naturalization)',
          'Приложите копии грин карты и документов',
          'Оплатите fee ($760 online / $710 paper + $85 biometrics)',
        ],
        tip: 'Подавайте за 90 дней до eligible date — USCIS принимает early filing.',
      },
      {
        title: 'Тест по гражданству (Civics)',
        description: '100 вопросов об истории и устройстве США. На экзамене задают 10, нужно 6 правильных.',
        steps: [
          'Изучите 100 вопросов USCIS (2025 version)',
          'Используйте приложения и flashcards',
          'На interview задают 10 случайных вопросов',
          'Нужно 6+ правильных ответов',
        ],
        tip: 'Вопросы публичны — списки доступны на uscis.gov/citizenship.',
      },
      {
        title: 'Тест по английскому',
        description: 'Проверка чтения, письма и базового разговорного английского на собеседовании.',
        steps: [
          'Reading: прочитать вслух 1 предложение',
          'Writing: написать 1 предложение диктовку',
          'Speaking: ответы на вопросы N-400 interview',
        ],
        tip: '65+ лет с 20+ years as LPR — упрощённые требования к English/civics.',
      },
      {
        title: 'Церемония присяги',
        description: 'Финальный шаг — принятие присяги и получение сертификата о натурализации.',
        steps: [
          'Получите Notice N-445 (Oath Ceremony)',
          'Сдайте грин карту на церемонии',
          'Произнесите Oath of Allegiance',
          'Получите Certificate of Naturalization',
        ],
        tip: 'После церемонии можно сразу подать на US passport.',
      },
    ],
  },
  {
    id: 'links',
    title: 'Полезные ссылки',
    emoji: '🔗',
    color: '#EA580C',
    items: [
      {
        title: 'USCIS — официальный сайт',
        description: 'Формы, статус заявок, новости иммиграционной политики.',
        url: 'https://www.uscis.gov',
      },
      {
        title: 'Travel.State.Gov — визы',
        description: 'Информация о неиммиграционных визах и запись на собеседование.',
        url: 'https://travel.state.gov',
      },
      {
        title: 'DV Lottery — регистрация',
        description: 'Официальный портал лотереи грин карт (октябрь–ноябрь каждого года).',
        url: 'https://dvprogram.state.gov',
      },
      {
        title: 'USA.gov — гид для иммигрантов',
        description: 'Государственные ресурсы: налоги, медицина, образование, права.',
        url: 'https://www.usa.gov/immigration-and-citizenship',
      },
      {
        title: 'FindLegalHelp — юридическая помощь',
        description: 'Поиск accredited представителей и иммиграционных адвокатов.',
        url: 'https://www.uscis.gov/scams-fraud-and-misconduct/avoid-scams/find-legal-services',
      },
    ],
  },
];

export function findGuideItem(sectionId, title) {
  const section = IMMIGRATION_SECTIONS.find((s) => s.id === sectionId);
  return section?.items.find((item) => item.title === title) ?? null;
}

export function findGuideContext(sectionId, title) {
  const section = IMMIGRATION_SECTIONS.find((s) => s.id === sectionId);
  const item = section?.items.find((i) => i.title === title);
  if (!section || !item) return null;
  return { section, item };
}
