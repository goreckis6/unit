const fs = require('fs');
const path = require('path');

const locales = [
  'pl', 'de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru',
  'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'
];

// Read English structure
const enPath = path.join(__dirname, '..', 'i18n', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const lettersToNumbersStructure = enData.calculators.lettersToNumbers;

console.log('Copying lettersToNumbers structure to all languages...');

locales.forEach(locale => {
  const filePath = path.join(__dirname, '..', 'i18n', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Add the structure
  if (!data.calculators) {
    data.calculators = {};
  }
  data.calculators.lettersToNumbers = JSON.parse(JSON.stringify(lettersToNumbersStructure));
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${locale}.json`);
});

console.log('\nDone! Structure copied to all languages.');
console.log('Now you need to translate the content manually.');
