#!/usr/bin/env node
// Копирует utils/contentFilter.js (ESM, приложение) в functions/contentFilter.js
// (CommonJS, Cloud Functions). Firebase деплоит только папку functions/, поэтому
// серверу нужна своя копия. Править только utils/contentFilter.js, потом:
//   node scripts/sync-content-filter.js
// С флагом --check — только проверить, что копия актуальна (exit 1, если нет).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'utils/contentFilter.js'), 'utf8');
const exported = [...src.matchAll(/^export function (\w+)/gm)].map((m) => m[1]);
if (exported.length === 0) throw new Error('В utils/contentFilter.js не найдено export function');

const out =
  '// СГЕНЕРИРОВАНО из utils/contentFilter.js — не править вручную.\n' +
  '// Обновить: node scripts/sync-content-filter.js\n' +
  src.replace(/^export function /gm, 'function ') +
  `\nmodule.exports = { ${exported.join(', ')} };\n`;

const target = path.join(root, 'functions/contentFilter.js');
if (process.argv.includes('--check')) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current !== out) {
    console.error('functions/contentFilter.js устарел — запустите node scripts/sync-content-filter.js');
    process.exit(1);
  }
  console.log('functions/contentFilter.js актуален');
} else {
  fs.writeFileSync(target, out);
  console.log(`functions/contentFilter.js обновлён (${exported.join(', ')})`);
}
