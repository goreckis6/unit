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

console.log('Verifying Pythagorean Theorem translation key counts...\n');

const results = [];

for (const file of langFiles) {
  const filePath = path.join(i18nDir, file);
  const lang = file.replace('.json', '');
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.calculators || !data.calculators.pythagoreanTheorem) {
      results.push({ lang, count: 0, status: 'MISSING' });
      continue;
    }
    
    const count = countKeys(data.calculators.pythagoreanTheorem);
    results.push({ lang, count, status: 'OK' });
  } catch (error) {
    results.push({ lang, count: 0, status: 'ERROR', error: error.message });
  }
}

// Group by count
const grouped = {};
for (const r of results) {
  const key = r.count;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(r.lang);
}

console.log('Key count distribution:');
for (const [count, langs] of Object.entries(grouped).sort((a, b) => Number(b[0]) - Number(a[0]))) {
  console.log(`  ${count} keys: ${langs.join(', ')}`);
}

console.log('\nDetails:');
for (const r of results.sort((a, b) => b.count - a.count)) {
  const status = r.status === 'OK' ? '✓' : '✗';
  console.log(`  ${status} ${r.lang.padEnd(4)}: ${r.count} keys ${r.error ? `(${r.error})` : ''}`);
}

// Check if all match
const counts = results.filter(r => r.status === 'OK').map(r => r.count);
const allMatch = counts.length > 0 && counts.every(c => c === counts[0]);

console.log(`\n${allMatch ? '✓ All languages have matching key counts!' : '✗ Key counts do not match across all languages'}`);
