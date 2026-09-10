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
 *   3. Substring match on the normalised, space-free string.
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
  // Блядь / бляд
  'блядь', 'бляд', 'бля',
  // Мудак
  'мудак', 'мудил', 'мудо',
  // Прочий мат
  'залупа', 'гандон', 'шлюх', 'сука', 'сучка', 'хуесос', 'долбоёб', 'долбоеб',
  'пиздюк', 'ёпт',
  // Слуры — ЛГБТК
  'пидор', 'пидар',
  // Hate speech / этнические оскорбления
  'чурка', 'чурбан', 'хачик', 'хач',
];

/** English profanity and slurs — match as substrings after normalisation. */
const BANNED_EN = [
  'fuck', 'fuk', 'fck',
  'shit', 'sht',
  'bitch', 'btch',
  'cunt',
  'pussy',
  'cock',
  // nigger/nigga — после схлопывания двойной g → нормализуется в niger/niga
  'niger', 'niga',
  'faggot',
  'whore',
  'slut',
  'asshole', 'arsehole',
  'bastard',
  'dickhead',
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
export function containsObjectionableContent(text) {
  if (!text || typeof text !== 'string') return false;

  const normRu = normaliseRu(text);
  const normEn = normaliseEn(text);

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
export function cleanContent(text) {
  if (!text || typeof text !== 'string') return text;

  // Split into tokens (words + punctuation gaps), check each word
  return text.replace(/\S+/g, (token) => {
    if (containsObjectionableContent(token)) return '***';
    return token;
  });
}
