// Разбор даты события из свободного текста («12 июля · 18:00»,
// «July 12 · 6:00 PM», «12.07 18:00») в точный момент времени по часовому
// поясу телефона. Нужен для напоминаний (сервер шлёт их по полю startsAt).
// Не распознали — возвращаем null: событие создаётся как раньше, просто
// без напоминаний. Когда в форме появится выбор даты, он заменит этот разбор.

const MONTHS = [
  // [индекс месяца, регулярка по началу слова]
  [0, /^(янв|jan)/], [1, /^(фев|feb)/], [2, /^(мар|mar)/], [3, /^(апр|apr)/],
  [4, /^(мая|май|may)/], [5, /^(июн|jun)/], [6, /^(июл|jul)/], [7, /^(авг|aug)/],
  [8, /^(сен|sep)/], [9, /^(окт|oct)/], [10, /^(ноя|nov)/], [11, /^(дек|dec)/],
];

function monthFromWord(word) {
  const lower = word.toLowerCase();
  const found = MONTHS.find(([, re]) => re.test(lower));
  return found ? found[0] : null;
}

function parseTime(text) {
  const withMinutes = text.match(/(\d{1,2}):(\d{2})\s*([ap])\.?\s*m?\.?/i)
    ?? text.match(/(\d{1,2}):(\d{2})/);
  const hourOnly = withMinutes ? null : text.match(/\b(\d{1,2})\s*([ap])\.?\s*m\.?(?![a-z])/i);
  const match = withMinutes ?? hourOnly;
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = withMinutes ? Number(match[2]) : 0;
  const meridiem = (withMinutes ? match[3] : match[2])?.toLowerCase();
  if (meridiem === 'p' && hours < 12) hours += 12;
  if (meridiem === 'a' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes, matched: match[0] };
}

function parseDay(text) {
  // «12 июля», «12-го июля»
  let m = text.match(/(\d{1,2})(?:-?го)?\s+([a-zа-яё]{3,})/i);
  if (m && monthFromWord(m[2]) !== null) return { day: Number(m[1]), month: monthFromWord(m[2]) };
  // «July 12», «Jul 12th»
  m = text.match(/([a-zа-яё]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (m && monthFromWord(m[1]) !== null) return { day: Number(m[2]), month: monthFromWord(m[1]) };
  // «12.07» (день.месяц, как пишут по-русски)
  m = text.match(/\b(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?\b/);
  if (m) {
    const year = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : null;
    return { day: Number(m[1]), month: Number(m[2]) - 1, year };
  }
  return null;
}

/**
 * @param {string} text Дата, как её ввёл пользователь.
 * @param {Date} [now] Текущий момент (для тестов).
 * @returns {Date|null}
 */
export function parseEventDate(text, now = new Date()) {
  if (!text || typeof text !== 'string') return null;
  const time = parseTime(text);
  if (!time) return null;
  const dayPart = parseDay(text.replace(time.matched, ' '));
  if (!dayPart || dayPart.month < 0 || dayPart.month > 11 || dayPart.day < 1) return null;

  let year = dayPart.year ?? now.getFullYear();
  let date = new Date(year, dayPart.month, dayPart.day, time.hours, time.minutes);
  if (date.getMonth() !== dayPart.month) return null; // 31 февраля и т.п.
  // Без года: дата, прошедшая больше двух дней назад, — это следующий год.
  if (dayPart.year == null && date.getTime() < now.getTime() - 2 * 86400000) {
    year += 1;
    date = new Date(year, dayPart.month, dayPart.day, time.hours, time.minutes);
  }
  return date;
}
