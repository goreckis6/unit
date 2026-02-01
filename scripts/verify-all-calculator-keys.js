const fs = require('fs');
const path = require('path');

function countKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return 0;
  let count = 0;
  for (const key in obj) {
    count++;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      count += countKeys(obj[key]);
    }
  }
  return count;
}

const i18nDir = path.join(__dirname, '../i18n');
const langFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));

console.log('Verifying translation key counts for new calculators...\n');

const calculators = ['quadraticEquation', 'pythagoreanTheorem', 'kineticEnergy'];

for (const calc of calculators) {
  console.log(`\n=== ${calc} ===`);
  const results = [];
  
  for (const file of langFiles) {
    const filePath = path.join(i18nDir, file);
    const lang = file.replace('.json', '');
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!data.calculators || !data.calculators[calc]) {
        results.push({ lang, count: 0, status: 'MISSING' });
        continue;
      }
      
      const count = countKeys(data.calculators[calc]);
      results.push({ lang, count, status: 'OK' });
    } catch (error) {
      results.push({ lang, count: 0, status: 'ERROR' });
    }
  }
  
  // Check if all match
  const counts = results.filter(r => r.status === 'OK').map(r => r.count);
  const allMatch = counts.length > 0 && counts.every(c => c === counts[0]);
  
  if (allMatch) {
    console.log(`✓ All ${results.length} languages have ${counts[0]} keys`);
  } else {
    console.log(`✗ Key counts vary:`);
    const grouped = {};
    for (const r of results) {
      if (!grouped[r.count]) grouped[r.count] = [];
      grouped[r.count].push(r.lang);
    }
    for (const [count, langs] of Object.entries(grouped)) {
      console.log(`  ${count} keys: ${langs.join(', ')}`);
    }
  }
}

console.log('\n✓ Verification complete!');
