/**
 * Apply calculators.conversionCalculators to all locale files from English 1:1 with translations.
 * Usage: node scripts/apply-conversion-calculators.js
 * Expects: scripts/conversion-calculators-translations.json with { "locale": [30 strings in order], ... }
 * Order: title, description, badge, searchPlaceholder, resultsFound, noResults, tryDifferentSearch,
 *        seoMeta.title, seoMeta.description, seoMeta.keywords,
 *        seoContent.heading, paragraph1, paragraph2, paragraph3, exampleHeading, exampleText, paragraph4,
 *        faq.heading, faq.items[0].question, faq.items[0].answer, ... faq.items[5].question, faq.items[5].answer
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'i18n');
const TRANSLATIONS_PATH = path.join(__dirname, 'conversion-calculators-translations.json');

function buildBlock(strings) {
  if (!strings || strings.length !== 30) throw new Error('Need exactly 30 strings');
  let i = 0;
  return {
    title: strings[i++],
    description: strings[i++],
    badge: strings[i++],
    searchPlaceholder: strings[i++],
    resultsFound: strings[i++],
    noResults: strings[i++],
    tryDifferentSearch: strings[i++],
    seoMeta: {
      title: strings[i++],
      description: strings[i++],
      keywords: strings[i++]
    },
    seoContent: {
      heading: strings[i++],
      paragraph1: strings[i++],
      paragraph2: strings[i++],
      paragraph3: strings[i++],
      exampleHeading: strings[i++],
      exampleText: strings[i++],
      paragraph4: strings[i++]
    },
    faq: {
      heading: strings[i++],
      items: [
        { question: strings[i++], answer: strings[i++] },
        { question: strings[i++], answer: strings[i++] },
        { question: strings[i++], answer: strings[i++] },
        { question: strings[i++], answer: strings[i++] },
        { question: strings[i++], answer: strings[i++] },
        { question: strings[i++], answer: strings[i++] }
      ]
    }
  };
}

function collectStringsInOrder(obj) {
  const order = ['title','description','badge','searchPlaceholder','resultsFound','noResults','tryDifferentSearch','seoMeta','seoContent','faq'];
  const seoMetaOrder = ['title','description','keywords'];
  const seoContentOrder = ['heading','paragraph1','paragraph2','paragraph3','exampleHeading','exampleText','paragraph4'];
  const out = [];
  function collect(o, keys) {
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string') out.push(v);
      else if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (k === 'seoMeta') collect(v, seoMetaOrder);
        else if (k === 'seoContent') collect(v, seoContentOrder);
        else if (k === 'faq') {
          out.push(v.heading);
          v.items.forEach(item => { out.push(item.question); out.push(item.answer); });
        }
      }
    }
  }
  collect(obj, order);
  return out;
}

function main() {
  const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf8'));
  const enPath = path.join(I18N_DIR, 'en.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enBlock = en.calculators.conversionCalculators;

  // Use English for en.json from translations if present, else keep as-is
  const locales = fs.readdirSync(I18N_DIR).filter(f => f.endsWith('.json'));
  for (const loc of locales) {
    const localeCode = loc.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, loc), 'utf8'));
    const strings = translations[localeCode];
    if (!strings || strings.length !== 30) {
      console.warn('Skip', loc, '- missing or wrong length in translations');
      continue;
    }
    data.calculators.conversionCalculators = buildBlock(strings);
    fs.writeFileSync(path.join(I18N_DIR, loc), JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('Updated', loc);
  }
  console.log('Done.');
}

main();
