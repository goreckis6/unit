const fs = require('fs');
const path = require('path');

// Read the English template
const enPath = path.join(__dirname, '../i18n/en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enPythagorean = enData.calculators.pythagoreanTheorem;

console.log('Adding Pythagorean Theorem calculator translations...');

// Get all language files
const i18nDir = path.join(__dirname, '../i18n');
const langFiles = fs.readdirSync(i18nDir)
  .filter(f => f.endsWith('.json') && f !== 'en.json');

console.log(`Found ${langFiles.length} language files to process`);

// Process each language file
for (const file of langFiles) {
  const filePath = path.join(i18nDir, file);
  const lang = file.replace('.json', '');
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.calculators) {
      console.log(`Skipping ${lang}: no calculators section found`);
      continue;
    }
    
    // Check if pythagoreanTheorem already exists
    if (data.calculators.pythagoreanTheorem) {
      console.log(`${lang}: Already has pythagoreanTheorem`);
      continue;
    }
    
    // Add pythagoreanTheorem after quadraticEquation
    const newCalculators = {};
    for (const [key, value] of Object.entries(data.calculators)) {
      newCalculators[key] = value;
      if (key === 'quadraticEquation') {
        // Insert pythagoreanTheorem here with English content
        newCalculators.pythagoreanTheorem = enPythagorean;
      }
    }
    
    data.calculators = newCalculators;
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`✓ Added pythagoreanTheorem to ${lang}`);
  } catch (error) {
    console.error(`Error processing ${lang}:`, error.message);
  }
}

console.log('Done!');
