#!/usr/bin/env node
/**
 * Validates that all locale JSON files contain title and description for every calculator
 * present in en.json. Run before releases to catch missing translations early.
 * Usage: node scripts/validate-calculator-translations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, '../i18n');

const enPath = path.join(i18nDir, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const calculators = en?.calculators ?? {};
const requiredKeys = Object.keys(calculators).filter(
  (k) =>
    calculators[k] &&
    typeof calculators[k] === 'object' &&
    ('title' in calculators[k] || 'description' in calculators[k])
);

const localeFiles = fs
  .readdirSync(i18nDir)
  .filter((f) => f.endsWith('.json') && f !== 'en.json');

let hasErrors = false;
console.log('Validating calculator translations...\n');

for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
  const calc = data?.calculators ?? {};
  const missing = [];

  for (const key of requiredKeys) {
    const entry = calc[key];
    if (!entry || typeof entry !== 'object') {
      missing.push(`${key} (whole block)`);
      continue;
    }
    if (!entry.title) missing.push(`${key}.title`);
    if (!entry.description) missing.push(`${key}.description`);
  }

  if (missing.length > 0) {
    hasErrors = true;
    console.log(`\x1b[31m✗ ${locale}\x1b[0m missing: ${missing.join(', ')}`);
  } else {
    console.log(`\x1b[32m✓ ${locale}\x1b[0m`);
  }
}

console.log('\n' + (hasErrors ? '\x1b[31mValidation failed.\x1b[0m' : '\x1b[32mAll locales OK.\x1b[0m'));
process.exit(hasErrors ? 1 : 0);
