import { POST_CATEGORIES } from '../data/postCategories';

const INTEREST_TO_CATEGORY = {
  IT: 'Карьера',
  Иммиграция: 'Иммиграция',
  Нетворкинг: 'Нетворкинг',
  Финансы: 'Финансы',
  Предпринимательство: 'Стартапы',
  Карьера: 'Карьера',
  'Жизнь в США': 'Жизнь в США',
  'Нью-Йорк': 'Жизнь в США',
  Стартапы: 'Стартапы',
  Сообщество: 'Сообщество',
};

const EXTRA_CATEGORIES = ['Карьера', 'Стартапы', 'Жизнь в США', 'Сообщество'];

export const FEED_CATEGORIES = ['Все', ...POST_CATEGORIES, ...EXTRA_CATEGORIES];

export function getCategoryForInterest(interest) {
  if (!interest) return 'Все';
  if (FEED_CATEGORIES.includes(interest) && interest !== 'Все') {
    return interest;
  }
  return INTEREST_TO_CATEGORY[interest] ?? interest;
}
