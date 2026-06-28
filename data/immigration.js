export const IMMIGRATION_SECTIONS = [
  {
    id: 'visas',
    title: { ru: 'Визы', en: 'Visas' },
    emoji: '🛂',
    color: '#2563EB',
    items: [
      {
        id: 'b1-b2',
        title: { ru: 'B-1 / B-2', en: 'B-1 / B-2' },
        description: {
          ru: 'Туристическая и деловая виза для краткосрочных поездок в США.',
          en: 'Tourist and business visa for short-term trips to the U.S.',
        },
        steps: {
          ru: [
            'Заполните форму DS-160 на ceac.state.gov',
            'Оплатите сбор MRV ($185)',
            'Запишитесь на собеседование в посольстве/консульстве',
            'Подготовьте документы: паспорт, фото, подтверждение связей с родиной',
          ],
          en: [
            'Fill out the DS-160 form at ceac.state.gov',
            'Pay the MRV fee ($185)',
            'Schedule an interview at the embassy/consulate',
            'Prepare documents: passport, photo, proof of ties to your home country',
          ],
        },
        tip: {
          ru: 'Честно отвечайте на вопросы консула — главное доказать, что вернётесь домой.',
          en: 'Answer the consular officer honestly — the key is proving you intend to return home.',
        },
      },
      {
        id: 'f1',
        title: { ru: 'F-1', en: 'F-1' },
        description: {
          ru: 'Студенческая виза для обучения в аккредитованных учебных заведениях.',
          en: 'Student visa for studying at accredited educational institutions.',
        },
        steps: {
          ru: [
            'Получите I-20 от учебного заведения (SEVP-approved)',
            'Оплатите SEVIS fee ($350)',
            'Заполните DS-160 и запишитесь на интервью',
            'На собеседовании покажите финансовую состоятельность',
          ],
          en: [
            'Get an I-20 from your school (SEVP-approved)',
            'Pay the SEVIS fee ($350)',
            'Fill out the DS-160 and schedule an interview',
            'Show proof of financial means at the interview',
          ],
        },
        tip: {
          ru: 'F-1 не даёт права работать off-campus без разрешения (CPT/OPT).',
          en: "F-1 doesn't allow off-campus work without authorization (CPT/OPT).",
        },
      },
      {
        id: 'h1b',
        title: { ru: 'H-1B', en: 'H-1B' },
        description: {
          ru: 'Рабочая виза для специалистов с высшим образованием. Лимитированная квота.',
          en: 'Work visa for specialists with a higher education degree. Limited annual quota.',
        },
        steps: {
          ru: [
            'Найдите работодателя-спонсора с E-Verify',
            'Работодатель подаёт LCA и регистрацию в H-1B lottery (март)',
            'При выигрыше — petition I-129 до 1 октября',
            'После одобрения — собеседование или change of status',
          ],
          en: [
            'Find a sponsoring employer registered with E-Verify',
            'Employer files an LCA and registers you for the H-1B lottery (March)',
            'If selected — petition I-129 filed by October 1',
            'After approval — visa interview or change of status',
          ],
        },
        tip: {
          ru: 'Cap season начинается 1 марта. Подготовьте дiploma evaluation заранее.',
          en: 'Cap season starts March 1. Get your diploma evaluation ready in advance.',
        },
      },
      {
        id: 'l1',
        title: { ru: 'L-1', en: 'L-1' },
        description: {
          ru: 'Перевод внутри компании для менеджеров и специалистов с опытом от 1 года.',
          en: 'Intra-company transfer for managers and specialists with 1+ year of experience.',
        },
        steps: {
          ru: [
            'Работайте в филиале компании за рубежом минимум 1 год',
            'Компания подаёт I-129 с доказательством связи между офисами',
            'L-1A для менеджеров, L-1B для специалистов',
          ],
          en: [
            "Work at the company's foreign branch for at least 1 year",
            'Company files I-129 with proof of the relationship between offices',
            'L-1A for managers, L-1B for specialists',
          ],
        },
        tip: {
          ru: 'L-1 — хорошая альтернатива H-1B без lottery.',
          en: 'L-1 is a good alternative to H-1B with no lottery involved.',
        },
      },
      {
        id: 'o1',
        title: { ru: 'O-1', en: 'O-1' },
        description: {
          ru: 'Виза для людей с выдающимися способностями в науке, искусстве или бизнесе.',
          en: 'Visa for people with extraordinary ability in science, the arts, or business.',
        },
        steps: {
          ru: [
            'Соберите доказательства: публикации, награды, высокая зарплата, экспертные письма',
            'Работодатель или агент подаёт I-129',
            'USCIS оценивает по 8 критериям (нужно 3+)',
          ],
          en: [
            'Gather evidence: publications, awards, high salary, expert letters',
            'Employer or agent files I-129',
            'USCIS evaluates against 8 criteria (3+ required)',
          ],
        },
        tip: {
          ru: 'Подходит для IT-специалистов с open source, патентами или senior roles.',
          en: 'A good fit for IT specialists with open source contributions, patents, or senior roles.',
        },
      },
      {
        id: 'k1',
        title: { ru: 'K-1', en: 'K-1' },
        description: {
          ru: 'Виза невесты/жениха гражданина США для вступления в брак в течение 90 дней.',
          en: "Fiancé(e) visa for a U.S. citizen's partner to marry within 90 days of arrival.",
        },
        steps: {
          ru: [
            'Гражданин США подаёт I-129F',
            'После одобрения — собеседование в консульстве',
            'Въезд в США и регистрация брака в течение 90 дней',
            'Подача I-485 для грин карты',
          ],
          en: [
            'U.S. citizen files I-129F',
            'After approval — consulate interview',
            'Enter the U.S. and register the marriage within 90 days',
            'File I-485 for a green card',
          ],
        },
        tip: {
          ru: 'Между одобрением I-129F и въездом действует ограничение по срокам — следите за датами.',
          en: 'There are time limits between I-129F approval and entry — keep track of the dates.',
        },
      },
    ],
  },
  {
    id: 'green-card',
    title: { ru: 'Грин карта', en: 'Green Card' },
    emoji: '🟢',
    color: '#059669',
    items: [
      {
        id: 'dv-lottery',
        title: { ru: 'Лотерея DV (Diversity Visa)', en: 'DV Lottery (Diversity Visa)' },
        description: {
          ru: 'Ежегодная бесплатная лотерея для граждан стран с низким уровнем иммиграции в США.',
          en: 'An annual free lottery for citizens of countries with low U.S. immigration rates.',
        },
        steps: {
          ru: [
            'Регистрация на dvprogram.state.gov (октябрь–ноябрь)',
            'Фото строго по спецификации (600×600 px, белый фон)',
            'Проверка результата в мае следующего года',
            'При выигрыше — подача DS-260 и прохождение interview',
          ],
          en: [
            'Register at dvprogram.state.gov (October–November)',
            'Photo must strictly follow specs (600×600 px, white background)',
            'Check results the following May',
            'If selected — file DS-260 and complete an interview',
          ],
        },
        tip: {
          ru: 'Регистрация бесплатна. Остерегайтесь мошенников, предлагающих «гарантированный» выигрыш.',
          en: 'Registration is free. Watch out for scammers offering a "guaranteed" win.',
        },
      },
      {
        id: 'family',
        title: { ru: 'Семейная иммиграция', en: 'Family-based Immigration' },
        description: {
          ru: 'Подача через супруга, родителей, детей или братьев/сестёр — граждан США или LPR.',
          en: 'Petitioning through a spouse, parent, child, or sibling who is a U.S. citizen or LPR.',
        },
        steps: {
          ru: [
            'Спонсор подаёт I-130 (Petition for Alien Relative)',
            'Ожидание visa bulletin (priority date)',
            'DS-260 или I-485 в зависимости от локации',
            'Medical exam и interview',
          ],
          en: [
            'Sponsor files I-130 (Petition for Alien Relative)',
            'Wait for the visa bulletin (priority date)',
            'DS-260 or I-485 depending on your location',
            'Medical exam and interview',
          ],
        },
        tip: {
          ru: 'Сроки сильно зависят от категории: для супругов граждан США — быстрее всего.',
          en: 'Timelines vary a lot by category: spouses of U.S. citizens are processed fastest.',
        },
      },
      {
        id: 'employment-based',
        title: {
          ru: 'Employment-based (EB-1, EB-2, EB-3)',
          en: 'Employment-based (EB-1, EB-2, EB-3)',
        },
        description: {
          ru: 'Грин карта через работодателя: для выдающихся специалистов, профессионалов и квалифицированных работников.',
          en: 'Green card through an employer: for outstanding specialists, professionals, and skilled workers.',
        },
        steps: {
          ru: [
            'PERM labor certification (для EB-2/EB-3, ~6–12 мес)',
            'I-140 Immigrant Petition',
            'Ожидание priority date в visa bulletin',
            'I-485 или consular processing',
          ],
          en: [
            'PERM labor certification (for EB-2/EB-3, ~6–12 months)',
            'I-140 Immigrant Petition',
            'Wait for the priority date in the visa bulletin',
            'I-485 or consular processing',
          ],
        },
        tip: {
          ru: 'EB-1 не требует PERM — быстрее для qualified candidates.',
          en: "EB-1 doesn't require PERM — faster for qualified candidates.",
        },
      },
      {
        id: 'eb5',
        title: { ru: 'EB-5 — инвесторская', en: 'EB-5 — Investor' },
        description: {
          ru: 'Постоянный статус при инвестициях от $800 000 в проекты, создающие рабочие места.',
          en: 'Permanent residence through an investment of $800,000+ in job-creating projects.',
        },
        steps: {
          ru: [
            'Выбор проекта через Regional Center или direct investment',
            'Инвестиция $800 000 (TEA) или $1 050 000',
            'I-526E petition',
            'Conditional green card → I-829 через 2 года',
          ],
          en: [
            'Choose a project through a Regional Center or direct investment',
            'Invest $800,000 (TEA) or $1,050,000',
            'I-526E petition',
            'Conditional green card → I-829 after 2 years',
          ],
        },
        tip: {
          ru: 'Тщательно проверяйте track record Regional Center — риск потери инвестиций.',
          en: "Carefully vet the Regional Center's track record — there's a risk of losing your investment.",
        },
      },
      {
        id: 'adjustment-of-status',
        title: { ru: 'Adjustment of Status (I-485)', en: 'Adjustment of Status (I-485)' },
        description: {
          ru: 'Смена статуса на постоянный резидент, если вы уже находитесь на территории США.',
          en: 'Changing status to permanent resident if you are already inside the U.S.',
        },
        steps: {
          ru: [
            'Проверьте eligibility (approved I-130/I-140, visa availability)',
            'Подайте I-485 + I-765 (work permit) + I-131 (travel)',
            'Biometrics appointment',
            'Interview (если требуется)',
          ],
          en: [
            'Check eligibility (approved I-130/I-140, visa availability)',
            'File I-485 + I-765 (work permit) + I-131 (travel document)',
            'Biometrics appointment',
            'Interview (if required)',
          ],
        },
        tip: {
          ru: 'После подачи I-485 можно получить EAD и advance parole для работы и поездок.',
          en: 'After filing I-485, you can get an EAD and advance parole to work and travel.',
        },
      },
    ],
  },
  {
    id: 'citizenship',
    title: { ru: 'Гражданство', en: 'Citizenship' },
    emoji: '🇺🇸',
    color: '#7C3AED',
    items: [
      {
        id: 'naturalization-requirements',
        title: { ru: 'Требования к натурализации', en: 'Naturalization Requirements' },
        description: {
          ru: 'Минимум 5 лет с грин картой (3 года, если состоите в браке с гражданином США).',
          en: 'At least 5 years with a green card (3 years if married to a U.S. citizen).',
        },
        steps: {
          ru: [
            '5 лет continuous residence (3 для marriage-based)',
            'Физическое присутствие: 30 ме months из 5 лет',
            'Good moral character',
            'Базовый английский и знание civics',
          ],
          en: [
            '5 years of continuous residence (3 for marriage-based)',
            'Physical presence: 30 months out of 5 years',
            'Good moral character',
            'Basic English and knowledge of civics',
          ],
        },
        tip: {
          ru: 'Поездки за 6+ months могут прервать continuous residence — консультируйтесь с адвокатом.',
          en: 'Trips of 6+ months can break continuous residence — consult a lawyer.',
        },
      },
      {
        id: 'n-400',
        title: { ru: 'Форма N-400', en: 'Form N-400' },
        description: {
          ru: 'Основная заявка на гражданство. Подаётся онлайн через личный кабинет USCIS.',
          en: 'The main citizenship application. Filed online through your USCIS account.',
        },
        steps: {
          ru: [
            'Создайте аккаунт на myuscis.gov',
            'Заполните N-400 (Application for Naturalization)',
            'Приложите копии грин карты и документов',
            'Оплатите fee ($760 online / $710 paper + $85 biometrics)',
          ],
          en: [
            'Create an account at myuscis.gov',
            'Fill out N-400 (Application for Naturalization)',
            'Attach copies of your green card and other documents',
            'Pay the fee ($760 online / $710 paper + $85 biometrics)',
          ],
        },
        tip: {
          ru: 'Подавайте за 90 дней до eligible date — USCIS принимает early filing.',
          en: 'File 90 days before your eligible date — USCIS accepts early filing.',
        },
      },
      {
        id: 'civics-test',
        title: { ru: 'Тест по гражданству (Civics)', en: 'Civics Test' },
        description: {
          ru: '100 вопросов об истории и устройстве США. На экзамене задают 10, нужно 6 правильных.',
          en: 'A bank of 100 questions on U.S. history and government. You get 10 of them and need 6 correct.',
        },
        steps: {
          ru: [
            'Изучите 100 вопросов USCIS (2025 version)',
            'Используйте приложения и flashcards',
            'На interview задают 10 случайных вопросов',
            'Нужно 6+ правильных ответов',
          ],
          en: [
            'Study the 100 USCIS questions (2025 version)',
            'Use apps and flashcards',
            'At the interview you get 10 random questions',
            'You need 6+ correct answers',
          ],
        },
        tip: {
          ru: 'Вопросы публичны — списки доступны на uscis.gov/citizenship.',
          en: 'The questions are public — lists are available at uscis.gov/citizenship.',
        },
      },
      {
        id: 'english-test',
        title: { ru: 'Тест по английскому', en: 'English Test' },
        description: {
          ru: 'Проверка чтения, письма и базового разговорного английского на собеседовании.',
          en: 'Tests reading, writing, and basic spoken English during the interview.',
        },
        steps: {
          ru: [
            'Reading: прочитать вслух 1 предложение',
            'Writing: написать 1 предложение диктовку',
            'Speaking: ответы на вопросы N-400 interview',
          ],
          en: [
            'Reading: read 1 sentence aloud',
            'Writing: write 1 dictated sentence',
            'Speaking: answer questions during the N-400 interview',
          ],
        },
        tip: {
          ru: '65+ лет с 20+ years as LPR — упрощённые требования к English/civics.',
          en: 'Age 65+ with 20+ years as an LPR — simplified English/civics requirements apply.',
        },
      },
      {
        id: 'oath-ceremony',
        title: { ru: 'Церемония присяги', en: 'Oath Ceremony' },
        description: {
          ru: 'Финальный шаг — принятие присяги и получение сертификата о натурализации.',
          en: 'The final step — taking the oath and receiving your naturalization certificate.',
        },
        steps: {
          ru: [
            'Получите Notice N-445 (Oath Ceremony)',
            'Сдайте грин карту на церемонии',
            'Произнесите Oath of Allegiance',
            'Получите Certificate of Naturalization',
          ],
          en: [
            'Receive Notice N-445 (Oath Ceremony)',
            'Surrender your green card at the ceremony',
            'Take the Oath of Allegiance',
            'Receive your Certificate of Naturalization',
          ],
        },
        tip: {
          ru: 'После церемонии можно сразу подать на US passport.',
          en: 'After the ceremony, you can apply for a U.S. passport right away.',
        },
      },
    ],
  },
  {
    id: 'links',
    title: { ru: 'Полезные ссылки', en: 'Useful Links' },
    emoji: '🔗',
    color: '#EA580C',
    items: [
      {
        id: 'uscis-official',
        title: { ru: 'USCIS — официальный сайт', en: 'USCIS — Official Website' },
        description: {
          ru: 'Формы, статус заявок, новости иммиграционной политики.',
          en: 'Forms, case status, and immigration policy news.',
        },
        url: 'https://www.uscis.gov',
      },
      {
        id: 'travel-state-gov',
        title: { ru: 'Travel.State.Gov — визы', en: 'Travel.State.Gov — Visas' },
        description: {
          ru: 'Информация о неиммиграционных визах и запись на собеседование.',
          en: 'Information on nonimmigrant visas and scheduling an interview.',
        },
        url: 'https://travel.state.gov',
      },
      {
        id: 'dv-lottery-registration',
        title: { ru: 'DV Lottery — регистрация', en: 'DV Lottery — Registration' },
        description: {
          ru: 'Официальный портал лотереи грин карт (октябрь–ноябрь каждого года).',
          en: 'The official green card lottery portal (October–November every year).',
        },
        url: 'https://dvprogram.state.gov',
      },
      {
        id: 'usa-gov-guide',
        title: { ru: 'USA.gov — гид для иммигрантов', en: 'USA.gov — Immigrant Guide' },
        description: {
          ru: 'Государственные ресурсы: налоги, медицина, образование, права.',
          en: 'Government resources: taxes, healthcare, education, and rights.',
        },
        url: 'https://www.usa.gov/immigration-and-citizenship',
      },
      {
        id: 'find-legal-help',
        title: { ru: 'FindLegalHelp — юридическая помощь', en: 'FindLegalHelp — Legal Assistance' },
        description: {
          ru: 'Поиск accredited представителей и иммиграционных адвокатов.',
          en: 'Find accredited representatives and immigration lawyers.',
        },
        url: 'https://www.uscis.gov/scams-fraud-and-misconduct/avoid-scams/find-legal-services',
      },
    ],
  },
];

export function findGuideItem(sectionId, id) {
  const section = IMMIGRATION_SECTIONS.find((s) => s.id === sectionId);
  return section?.items.find((item) => item.id === id) ?? null;
}

export function findGuideContext(sectionId, id) {
  const section = IMMIGRATION_SECTIONS.find((s) => s.id === sectionId);
  const item = section?.items.find((i) => i.id === id);
  if (!section || !item) return null;
  return { section, item };
}
