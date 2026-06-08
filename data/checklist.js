export const CHECKLIST_ITEMS = [
  {
    id: 'ssn',
    title: 'Получить SSN (Social Security Number)',
    description: 'Нужен для работы и налогов. Подайте заявку в SSA office с паспортом и I-94.',
    category: 'Документы',
    guideLink: { sectionId: 'links', title: 'USA.gov — гид для иммигрантов' },
  },
  {
    id: 'bank',
    title: 'Открыть банковский счёт',
    description: 'Chase, Bank of America или credit union. Понадобится паспорт и proof of address.',
    category: 'Финансы',
    guideLink: { sectionId: 'links', title: 'USA.gov — гид для иммигрантов' },
  },
  {
    id: 'phone',
    title: 'Американский номер телефона',
    description: 'Prepaid SIM (Mint, Visible) или family plan. Нужен для 2FA и работы.',
    category: 'Быт',
  },
  {
    id: 'health',
    title: 'Медицинская страховка',
    description: 'Через работодателя, Marketplace (ACA) или Medicaid — в зависимости от статуса.',
    category: 'Здоровье',
    guideLink: { sectionId: 'links', title: 'USA.gov — гид для иммигрантов' },
  },
  {
    id: 'license',
    title: 'Driver\'s license / ID штата',
    description: 'DMV вашего штата. Обычно нужны: I-94, 2 proof of address, SSN или waiver.',
    category: 'Документы',
    guideLink: { sectionId: 'green-card', title: 'Adjustment of Status (I-485)' },
  },
  {
    id: 'credit',
    title: 'Начать credit history',
    description: 'Secured credit card или authorized user. Важно для аренды и кредитов.',
    category: 'Финансы',
  },
  {
    id: 'housing',
    title: 'Жильё: аренда или покупка',
    description: 'Zillow, StreetEasy (NYC), Facebook groups. Готовьте pay stubs и references.',
    category: 'Быт',
  },
  {
    id: 'taxes',
    title: 'Разобраться с налогами',
    description: 'W-4 у работодателя, ITIN/SSN для filing. TurboTax или CPA для первого года.',
    category: 'Финансы',
    guideLink: { sectionId: 'links', title: 'USA.gov — гид для иммигрантов' },
  },
  {
    id: 'community',
    title: 'Найти своё сообщество',
    description: 'Vmeste, Telegram-группы, местные русскоязычные центры и церкви.',
    category: 'Сообщество',
  },
  {
    id: 'english',
    title: 'Курсы английского (ESL)',
    description: 'Бесплатные ESL классы в public library или community college.',
    category: 'Образование',
    guideLink: { sectionId: 'citizenship', title: 'Тест по английскому' },
  },
];

export function getChecklistItemById(id) {
  return CHECKLIST_ITEMS.find((item) => item.id === id);
}
