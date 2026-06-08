export const MEMBERS = [
  {
    id: '1',
    name: 'Анна К.',
    role: 'Product Manager · Google',
    city: 'Сиэтл',
    country: '🇺🇸',
    bio: '10 лет в продуктовом менеджменте. Помогаю с карьерой в tech и подготовкой к интервью.',
    interests: ['IT', 'Карьера', 'Менторство'],
  },
  {
    id: '2',
    name: 'Дмитрий С.',
    role: 'Основатель стартапа',
    city: 'Остин',
    country: '🇺🇸',
    bio: 'Основал SaaS-стартап в Austin. Открыт к знакомствам с предпринимателями из СНГ.',
    interests: ['Стартапы', 'SaaS', 'Нетворкинг'],
  },
  {
    id: '3',
    name: 'Елена М.',
    role: 'Immigration Attorney',
    city: 'Чикаго',
    country: '🇺🇸',
    bio: 'Иммиграционный адвокат с 15-летним стажем. Специализация: рабочие визы и грин карта.',
    interests: ['Иммиграция', 'H-1B', 'Консультации'],
  },
  {
    id: '4',
    name: 'Артём В.',
    role: 'Software Engineer · Meta',
    city: 'Менло-Парк',
    country: '🇺🇸',
    bio: 'Backend-инженер в Meta. Делюсь опытом переезда и подготовки к coding interviews.',
    interests: ['IT', 'System Design', 'Менторство'],
  },
];

export function getMemberById(id) {
  return MEMBERS.find((member) => member.id === id);
}
