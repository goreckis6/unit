const fs = require('fs');
const path = require('path');

const plPath = path.join(__dirname, '../i18n/pl.json');
let data = fs.readFileSync(plPath, 'utf8');

// Replace Polish quotation marks with standard ASCII quotes
data = data.replace(/„/g, '\\"');
data = data.replace(/"/g, '\\"');

fs.writeFileSync(plPath, data, 'utf8');
console.log('Fixed Polish quotes');

// Verify it's valid JSON
try {
  JSON.parse(data);
  console.log('JSON is now valid!');
} catch(e) {
  console.error('Still has errors:', e.message);
}
