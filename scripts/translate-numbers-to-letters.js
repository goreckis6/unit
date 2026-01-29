const fs = require('fs');
const path = require('path');

// Read English content
const enPath = path.join(__dirname, '..', 'i18n', 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const numbersToLetters = enContent.calculators.numbersToLetters;

// Languages to translate (excluding English and Polish which is already done)
const languages = ['de', 'fr', 'es', 'it', 'nl', 'pt', 'cs', 'sk', 'hu', 'sv', 'no', 'da', 'fi', 'ro', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'id', 'tr'];

console.log('Starting translation of numbersToLetters to all languages...');
console.log(`Total languages: ${languages.length}`);

languages.forEach((lang) => {
  const langPath = path.join(__dirname, '..', 'i18n', `${lang}.json`);
  
  if (!fs.existsSync(langPath)) {
    console.log(`⚠️  ${lang}.json not found, skipping...`);
    return;
  }

  try {
    const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // Check if numbersToLetters already exists
    if (langContent.calculators?.numbersToLetters) {
      console.log(`⏭️  ${lang}: numbersToLetters already exists, skipping...`);
      return;
    }

    // Add numbersToLetters before notFound
    if (!langContent.calculators) {
      langContent.calculators = {};
    }
    
    if (!langContent.calculators.numbersToLetters) {
      langContent.calculators.numbersToLetters = JSON.parse(JSON.stringify(numbersToLetters));
    }

    // Write back
    fs.writeFileSync(langPath, JSON.stringify(langContent, null, 2) + '\n', 'utf8');
    console.log(`✅ ${lang}: Added numbersToLetters structure (needs manual translation)`);
  } catch (error) {
    console.error(`❌ ${lang}: Error - ${error.message}`);
  }
});

console.log('\n✅ Structure copied to all languages.');
console.log('⚠️  Note: Content needs manual translation for each language.');
