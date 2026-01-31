const fs = require('fs');
const path = require('path');

// Read the English template
const enPath = path.join(__dirname, '../i18n/en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enRemainder = enData.calculators.remainder;

// Language mappings for the remainder calculator
const translations = {
  pl: {
    formulaHeading: "Dzielenie euklidesowe:",
    formulaText: "a = bq + r, gdzie 0 ≤ r < |b| (b ≠ 0)",
    dividendLabel: "Dzielna (a)",
    dividendPlaceholder: "np. 23",
    divisorLabel: "Dzielnik (b)",
    divisorPlaceholder: "np. 5",
    divisorHelp: "Reszta jest obliczana z użyciem |b|, więc zawsze jest nieujemna.",
    calculate: "Oblicz",
    reset: "Resetuj",
    resultLabel: "Wynik",
    remainderValue: "Reszta: {value}",
    quotientValue: "Iloraz: {value}",
    equation: "{a} = {b} × {q} + {r}",
    copyRemainder: "Kopiuj resztę",
    errorInvalidDividend: "Podaj poprawną liczbę całkowitą jako dzielną.",
    errorInvalidDivisor: "Podaj poprawną liczbę całkowitą jako dzielnik.",
    errorDivisionByZero: "Dzielenie przez zero jest niedozwolone."
  }
};

// Get all language files except English and German (which are already complete)
const i18nDir = path.join(__dirname, '../i18n');
const langFiles = fs.readdirSync(i18nDir)
  .filter(f => f.endsWith('.json') && !['en.json', 'de.json'].includes(f));

console.log(`Found ${langFiles.length} language files to process`);

// Process each language file
for (const file of langFiles) {
  const filePath = path.join(i18nDir, file);
  const lang = file.replace('.json', '');
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.calculators || !data.calculators.remainder) {
      console.log(`Skipping ${lang}: no remainder calculator found`);
      continue;
    }
    
    const remainder = data.calculators.remainder;
    
    // Check if SEO sections exist
    if (!remainder.seo || !remainder.seo.content || !remainder.seo.faq || !remainder.seo.related) {
      console.log(`${lang}: Missing SEO sections, copying structure from English`);
      
      // Keep existing title and description
      const title = remainder.title;
      const description = remainder.description;
      
      // Copy the full structure from English remainder, preserving title/description
      data.calculators.remainder = {
        ...enRemainder,
        title,
        description
      };
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`✓ Fixed ${lang}`);
    } else {
      console.log(`${lang}: Already has complete SEO sections`);
    }
  } catch (error) {
    console.error(`Error processing ${lang}:`, error.message);
  }
}

console.log('Done!');
