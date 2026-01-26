const fs = require('fs');
const path = require('path');

// Get all calculator directories
const electricDir = path.join('app', '[locale]', 'calculators', 'electric');
const mathDir = path.join('app', '[locale]', 'calculators', 'math');

const electricDirs = fs.readdirSync(electricDir)
  .filter(f => fs.statSync(path.join(electricDir, f)).isDirectory())
  .sort();

const mathDirs = fs.readdirSync(mathDir)
  .filter(f => fs.statSync(path.join(mathDir, f)).isDirectory())
  .sort();

// Sitemap routes from route.ts
const sitemapRoutes = [
  '/calculators/math/addition',
  '/calculators/electric/watts-to-kva',
  '/calculators/electric/watts-to-va',
  '/calculators/electric/amp-to-kw',
  '/calculators/electric/kw-to-amps',
  '/calculators/electric/kw-to-volts',
  '/calculators/electric/kw-to-kwh',
  '/calculators/electric/kw-to-va',
  '/calculators/electric/kw-to-kva',
  '/calculators/electric/kwh-to-watts',
  '/calculators/electric/mah-to-wh',
  '/calculators/electric/wh-to-mah',
  '/calculators/electric/va-to-amps',
  '/calculators/electric/va-to-watts',
  '/calculators/electric/va-to-kw',
  '/calculators/electric/va-to-kva',
  '/calculators/electric/amp-to-kva',
  '/calculators/electric/amps-to-va',
  '/calculators/electric/amps-to-volt',
  '/calculators/electric/volts-to-amps',
  '/calculators/electric/volts-to-watts',
  '/calculators/electric/volts-to-kw',
  '/calculators/electric/amps-to-watts',
  '/calculators/electric/watts-to-amps',
  '/calculators/electric/electron-volts-to-volts',
  '/calculators/electric/volts-to-electron-volts',
  '/calculators/electric/joules-to-watts',
  '/calculators/electric/watts-to-joules',
  '/calculators/electric/watts-to-kwh',
  '/calculators/electric/watts-to-volts',
  '/calculators/electric/joules-to-volts',
  '/calculators/electric/volts-to-joules',
  '/calculators/electric/kva-to-amps',
  '/calculators/electric/kva-to-watts',
  '/calculators/electric/kva-to-kw',
  '/calculators/electric/kva-to-va',
];

// Read i18n file
const i18nContent = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));
const i18nKeys = Object.keys(i18nContent.calculators || {}).filter(k => 
  k !== 'mathCalculators' && k !== 'electricCalculators'
);

// Convert directory names to routes
const electricRoutes = electricDirs.map(d => `/calculators/electric/${d}`);
const mathRoutes = mathDirs.map(d => `/calculators/math/${d}`);

// Convert sitemap routes to directory names
const sitemapElectricDirs = sitemapRoutes
  .filter(r => r.startsWith('/calculators/electric/'))
  .map(r => r.replace('/calculators/electric/', ''))
  .sort();

const sitemapMathDirs = sitemapRoutes
  .filter(r => r.startsWith('/calculators/math/'))
  .map(r => r.replace('/calculators/math/', ''))
  .sort();

// Helper: Convert kebab-case to camelCase (handling both singular/plural variations)
function kebabToCamel(kebab) {
  return kebab.split('-').map((w, i) => 
    i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)
  ).join('');
}

// Helper: Check if directory has i18n support (try both singular and plural variations)
function hasI18nSupport(dirName) {
  const camel = kebabToCamel(dirName);
  // Try exact match
  if (i18nKeys.includes(camel)) return true;
  // Try singular/plural variations
  if (dirName.startsWith('amps-')) {
    const singular = 'amp' + camel.substring(4);
    if (i18nKeys.includes(singular)) return true;
  }
  if (dirName.startsWith('amp-')) {
    const plural = 'amps' + camel.substring(3);
    if (i18nKeys.includes(plural)) return true;
  }
  return false;
}

console.log('=== VERIFICATION REPORT ===\n');

console.log('ELECTRIC CALCULATORS:');
console.log(`Directories found: ${electricDirs.length}`);
console.log(`Sitemap entries: ${sitemapElectricDirs.length}`);
console.log(`i18n entries: ${i18nKeys.length}\n`);

// Find missing in sitemap
const missingInSitemap = electricDirs.filter(d => !sitemapElectricDirs.includes(d));
if (missingInSitemap.length > 0) {
  console.log('❌ MISSING IN SITEMAP:');
  missingInSitemap.forEach(d => console.log(`   - ${d}`));
  console.log('');
} else {
  console.log('✅ All electric calculators are in sitemap\n');
}

// Find extra in sitemap
const extraInSitemap = sitemapElectricDirs.filter(d => !electricDirs.includes(d));
if (extraInSitemap.length > 0) {
  console.log('⚠️  EXTRA IN SITEMAP (not in directories):');
  extraInSitemap.forEach(d => console.log(`   - ${d}`));
  console.log('');
} else {
  console.log('✅ No extra entries in sitemap\n');
}

// Find missing in i18n
const missingInI18n = electricDirs.filter(d => !hasI18nSupport(d));
if (missingInI18n.length > 0) {
  console.log('❌ MISSING IN I18N:');
  missingInI18n.forEach(d => {
    const camel = kebabToCamel(d);
    console.log(`   - ${d} (expected key: ${camel} or variant)`);
  });
  console.log('');
} else {
  console.log('✅ All electric calculators have i18n support\n');
}

console.log('\nMATH CALCULATORS:');
console.log(`Directories found: ${mathDirs.length}`);
console.log(`Sitemap entries: ${sitemapMathDirs.length}`);
console.log(`i18n entries: ${mathDirs.filter(d => d === 'addition' && i18nKeys.includes('addition')).length}\n`);

// Find missing in sitemap
const missingMathInSitemap = mathDirs.filter(d => !sitemapMathDirs.includes(d));
if (missingMathInSitemap.length > 0) {
  console.log('❌ MISSING IN SITEMAP:');
  missingMathInSitemap.forEach(d => console.log(`   - ${d}`));
  console.log('');
} else {
  console.log('✅ All math calculators are in sitemap\n');
}

// Find missing in i18n
const missingMathInI18n = mathDirs.filter(d => d !== 'addition' || !i18nKeys.includes('addition'));
if (missingMathInI18n.length > 0) {
  console.log('❌ MISSING IN I18N:');
  missingMathInI18n.forEach(d => console.log(`   - ${d}`));
  console.log('');
} else {
  console.log('✅ All math calculators have i18n support\n');
}

// Summary
console.log('\n=== SUMMARY ===');
const totalIssues = missingInSitemap.length + missingInI18n.length + missingMathInSitemap.length + missingMathInI18n.length;
if (totalIssues === 0) {
  console.log('✅ All calculators are properly configured!');
  console.log(`   - ${electricDirs.length} electric calculators`);
  console.log(`   - ${mathDirs.length} math calculators`);
  console.log(`   - All have sitemap entries`);
  console.log(`   - All have i18n support`);
} else {
  console.log(`❌ Found ${totalIssues} issue(s) that need to be fixed:`);
  if (missingInSitemap.length > 0) {
    console.log(`   - ${missingInSitemap.length} calculator(s) missing from sitemap`);
  }
  if (missingInI18n.length > 0) {
    console.log(`   - ${missingInI18n.length} calculator(s) missing from i18n`);
  }
  if (missingMathInSitemap.length > 0) {
    console.log(`   - ${missingMathInSitemap.length} math calculator(s) missing from sitemap`);
  }
  if (missingMathInI18n.length > 0) {
    console.log(`   - ${missingMathInI18n.length} math calculator(s) missing from i18n`);
  }
}
