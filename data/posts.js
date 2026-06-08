export const POSTS = [
  {
    id: '1',
    author: 'Анна К.',
    city: 'Сиэтл',
    time: '2 ч назад',
    content:
      'Кто-нибудь сдавал NCLEX недавно? Поделитесь, как готовились — собираю ресурсы для подруги-медсестры.',
    likes: 24,
    category: 'Карьера',
    replies: [
      {
        id: 'r1',
        author: 'Елена М.',
        text: 'UWorld — лучший ресурс. Сдала с первого раза!',
        time: '1 ч назад',
      },
      {
        id: 'r2',
        author: 'Олег П.',
        text: 'Ещё рекомендую Archer Review — бесплатные пробные тесты.',
        time: '45 мин назад',
      },
    ],
  },
  {
    id: '2',
    author: 'Дмитрий С.',
    city: 'Остин',
    time: '5 ч назад',
    content:
      'Ищу co-founder для edtech-стартапа (русский/английский). Нужен человек с опытом в маркетинге. DM открыт!',
    likes: 41,
    category: 'Стартапы',
    replies: [],
  },
  {
    id: '3',
    author: 'Елена М.',
    city: 'Чикаго',
    time: '1 день назад',
    content:
      'Напоминаю: deadline DV Lottery обычно в ноябре. Начните собирать фото и документы заранее — не оставляйте на последний день.',
    likes: 89,
    category: 'Иммиграция',
    replies: [
      {
        id: 'r3',
        author: 'Катя Л.',
        text: 'Спасибо за напоминание! Где лучше делать фото — Walgreens или CVS?',
        time: '20 ч назад',
      },
    ],
  },
  {
    id: '4',
    author: 'Олег П.',
    city: 'Бруклин',
    time: '1 день назад',
    content:
      'Открылся отличный русский магазин на Brighton Beach — свежая рыба и домашняя выпечка. Адрес: Brighton 4th St, 123.',
    likes: 56,
    category: 'Жизнь в США',
    replies: [],
  },
  {
    id: '5',
    author: 'Катя Л.',
    city: 'Майами',
    time: '2 дня назад',
    content:
      'Провожу бесплатный воркшоп по резюме в американском формате в субботу онлайн. Запись через события в Нетворкинге.',
    likes: 33,
    category: 'Карьера',
    replies: [],
  },
];

export function getPostById(id, posts) {
  return posts.find((post) => post.id === id);
}
