// СГЕНЕРИРОВАНО из utils/contentFilter.js — не править вручную.
// Обновить: node scripts/sync-content-filter.js
/**
 * Content filter for Apple Guideline 1.2 compliance.
 * Blocks objectionable content (profanity, slurs, hate speech) at submission time.
 *
 * Strategy:
 *   1. Normalise text: lowercase → substitute common obfuscation chars →
 *      collapse repeated letters → strip non-alpha chars → concatenate
 *      (catches spaced-out words like "х у й" and substitutions like "ху@")
 *   2. Two separate checks: Russian (Cyrillic roots) and English (Latin roots),
 *      because converting all Latin → Cyrillic would break English detection.
 *   3. Substring match on the normalised, space-free string. Short roots that
 *      occur inside ordinary words ("рубля", "хачапури", "cocktail") are
 *      matched per word instead (BANNED_RU_WORDS / BANNED_EN_WORDS).
 *   4. cleanContent() masks matched words in the original text with ***.
 */

// ─── Banned word roots ────────────────────────────────────────────────────────

/** Russian mat and slurs — match as substrings after normalisation. */
const BANNED_RU = [
  // Ядро "хуй"
  'хуй', 'хую', 'хуя', 'хуе', 'хуйл',
  // Ядро "пизд"
  'пизд',
  // Ядро "ёб" — "ё" перед "б" крайне редка в нормальной русской лексике,
  // поэтому "ёб" как подстрока безопасна. Е-формы ("еб") дают false positives
  // в "дебаты", "хлебать" и т.п. — используем только специфичные е-формы.
  'ёб',
  // Однозначные приставочные е-формы
  'уеб', 'заеб', 'наеб', 'выеб', 'поеб',
  // Compound: еблан, ебло (не встречаются в нормальных словах)
  'еблан', 'ебло',
  // Блядь / бляд ("бля" отдельно — в BANNED_RU_WORDS: "рубля", "корабля")
  'блядь', 'бляд',
  // Мудак
  'мудак', 'мудил', 'мудо',
  // Прочий мат ("сука" — в BANNED_RU_WORDS: фамилия "Сукасян", "сукно")
  'залупа', 'гандон', 'шлюх', 'хуесос',
  // долбоёб и все фонетические варианты: далбаёб/далбаеб/долбаеб/далбоеб
  // ё-варианты ловятся через корень 'ёб' выше; е-варианты через 'лбаеб'/'лбоеб'
  'долбоёб', 'долбоеб', 'лбаеб', 'лбоеб',
  'пиздюк', 'ёпт',
  // Слуры — ЛГБТК
  'пидор', 'пидар',
  // Hate speech / этнические оскорбления ("хач" — в BANNED_RU_WORDS: "хачапури", "Хачатурян")
  'чурка', 'чурбан',
];

/**
 * Короткие корни, которые как подстрока дают ложные срабатывания внутри
 * обычных слов и фамилий. Проверяются по отдельным словам.
 */
const BANNED_RU_WORDS = [
  // "ебать", "ебаный": е-формы как подстрока ловят "дебаты", "хлебать"
  /^еб(?!ург)/, // "Ебург" — Екатеринбург
  /^бля/,
  /^сук(а|и|е|у|ой|ам|ами|ах|ин.*)$/,
  /^сучк/,
  /^хач(и|ик.*|ей|ам|ами|ах)?$/,
];

/**
 * Обычные слова, внутри которых встречается запрещённый корень:
 * "страхую", "застрахуйте" содержат "хую"/"хуй".
 */
const ALLOWED_RU_ROOTS = ['страху'];

/** English profanity and slurs — match as substrings after normalisation. */
const BANNED_EN = [
  'fuck', 'fuk', 'fck',
  'shit',
  'bitch', 'btch',
  'pussy',
  // Двойные буквы схлопываются нормализацией: faggot → fagot, asshole → ashole
  'fagot',
  'whore',
  'slut',
  'ashole', 'arsehole',
  'bastard',
  'dickhead',
];

/** English roots checked per word: "Scunthorpe", "cocktail", "Nigeria", "ashtray". */
const BANNED_EN_WORDS = [
  /^sht$/,
  /^cunt/,
  /^cock(s|sucker.*)?$/,
  // nigger/nigga — после схлопывания двойной g → niger/niga
  /^nig(er|a)s?$/,
];

// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * Normalise text for Russian profanity detection.
 * Converts Latin lookalikes → Cyrillic, common number/symbol substitutions,
 * collapses repeated chars, strips non-Cyrillic.
 */
function normaliseRu(text) {
  return text
    .toLowerCase()
    // Number / symbol substitutions (language-agnostic)
    .replace(/@/g, 'а')
    .replace(/\$/g, 'с')
    .replace(/0/g, 'о')
    .replace(/1/g, 'и')
    .replace(/3/g, 'е')
    .replace(/4/g, 'ч')
    .replace(/5/g, 'с')
    .replace(/6/g, 'б')
    // Latin → Cyrillic lookalikes (used to evade Cyrillic filters)
    .replace(/a/g, 'а')
    .replace(/e/g, 'е')
    .replace(/o/g, 'о')
    .replace(/p/g, 'р')
    .replace(/c/g, 'с')
    .replace(/x/g, 'х')
    .replace(/y/g, 'у')
    .replace(/k/g, 'к')
    .replace(/m/g, 'м')
    .replace(/b/g, 'б')
    .replace(/i/g, 'и')
    .replace(/h/g, 'х') // реже, но встречается
    // Collapse repeated chars (пиззда → пизда, хууй → хуй)
    .replace(/(.)\1+/g, '$1')
    // Strip everything except Cyrillic
    .replace(/[^а-яё]/g, '');
}

/**
 * Normalise text for English profanity detection.
 * Substitutes common leet-speak, collapses repeated chars, strips non-Latin.
 */
function normaliseEn(text) {
  return text
    .toLowerCase()
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\+/g, 't')
    // Collapse repeated chars
    .replace(/(.)\1+/g, '$1')
    // Strip everything except Latin
    .replace(/[^a-z]/g, '');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if `text` contains objectionable content.
 *
 * Checks are performed on the normalised, space-free version of the text,
 * catching spaced-out words (е б а т ь) and common letter substitutions.
 */
function containsObjectionableContent(text) {
  if (!text || typeof text !== 'string') return false;

  // Слова-исключения убираем до склейки, иначе корень найдётся и в склеенной строке.
  const tokens = text
    .split(/\s+/)
    .filter((token) => !ALLOWED_RU_ROOTS.some((root) => normaliseRu(token).includes(root)));

  for (const token of tokens) {
    const wordRu = normaliseRu(token);
    const wordEn = normaliseEn(token);
    if (BANNED_RU_WORDS.some((pattern) => pattern.test(wordRu))) return true;
    if (BANNED_EN_WORDS.some((pattern) => pattern.test(wordEn))) return true;
  }

  const joined = tokens.join(' ');
  const normRu = normaliseRu(joined);
  const normEn = normaliseEn(joined);

  for (const word of BANNED_RU) {
    if (normRu.includes(word)) return true;
  }
  for (const word of BANNED_EN) {
    if (normEn.includes(word)) return true;
  }
  return false;
}

/**
 * Returns a copy of `text` with objectionable words replaced by ***.
 * Uses a word-level scan on the original text for display purposes.
 *
 * Note: this is a best-effort soft mask; hard blocking via
 * containsObjectionableContent() is the primary protection.
 */
function cleanContent(text) {
  if (!text || typeof text !== 'string') return text;

  // Split into tokens (words + punctuation gaps), check each word
  return text.replace(/\S+/g, (token) => {
    if (containsObjectionableContent(token)) return '***';
    return token;
  });
}

module.exports = { containsObjectionableContent, cleanContent };
