/**
 * Script to add WebApplication schema to ALL calculator components
 * Works even for calculators in migration (with TODO comments)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/components-qwik');
const files = fs.readdirSync(componentsDir);

// Exclude non-calculator files
const exclude = ['Navbar.tsx', 'Footer.tsx', 'MathCalculators.tsx', 'ElectricalCalculator.tsx', 'MultiplyingFractions.tsx', 'SubtractingFractions.tsx', 'RandomNumbersGenerator.tsx'];

const calculatorFiles = files.filter(file => 
  file.endsWith('Calculator.tsx') && 
  !exclude.includes(file)
);

console.log(`Found ${calculatorFiles.length} calculator files`);

// Map of calculator file names to translation keys
const translationKeyMap = {
  'AddingFractionsCalculator.tsx': 'adding-fractions-calculator',
  'DividingFractionsCalculator.tsx': 'dividing-fractions-calculator',
  'SimplifyingFractionsCalculator.tsx': 'simplifying-fractions-calculator',
  'AmpsToKilowattsCalculator.tsx': 'amps-to-kilowatts-calculator',
  'AmpsToKvaCalculator.tsx': 'amps-to-kva-calculator',
  'AmpsToVaCalculator.tsx': 'amps-to-va-calculator',
  'AmpsToVoltsCalculator.tsx': 'amps-to-volts-calculator',
  'AmpsToWattsCalculator.tsx': 'amps-to-watts-calculator',
  'PowerCalculator.tsx': 'power-calculator',
  'PolynomialRemainderCalculator.tsx': 'polynomial-remainder-calculator',
  'ConvolutionCalculator.tsx': 'convolution-calculator',
  'OhmsLawCalculator.tsx': 'ohms-law-calculator',
  'VoltageDividerCalculator.tsx': 'voltage-divider-calculator',
  'VoltageDropCalculator.tsx': 'voltage-drop-calculator',
  'WireGaugeCalculator.tsx': 'wire-gauge-calculator',
  'ElectricBillCalculator.tsx': 'electric-bill-calculator',
  'EnergyConsumptionCalculator.tsx': 'energy-consumption-calculator',
  'KineticEnergyCalculator.tsx': 'kinetic-energy-calculator',
  'WattsVoltsAmpsOhmsCalculator.tsx': 'watts-volts-amps-ohms-calculator',
};

let updated = 0;
let skipped = 0;
let errors = 0;

calculatorFiles.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has getWebAppSchema
  if (content.includes('getWebAppSchema')) {
    skipped++;
    return;
  }
  
  // Skip if doesn't have t() and loc
  if (!content.includes('const t = useTranslate()') && !content.includes('const t = useTranslate();') && 
      !content.includes('const { t } = useTranslate()')) {
    errors++;
    console.log(`⚠ Skipping ${file} - no useTranslate found`);
    return;
  }
  
  // Extract calculator key from file name or use mapping
  let calculatorKey;
  if (translationKeyMap[file]) {
    calculatorKey = translationKeyMap[file];
  } else {
    // Convert PascalCase to kebab-case (e.g., CeilingCalculator -> ceiling-calculator)
    calculatorKey = file.replace('Calculator.tsx', '')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
  
  // Add import for useVisibleTask$ if not present
  if (!content.includes('useVisibleTask$')) {
    if (content.includes("import { component$, useSignal, $ } from '@builder.io/qwik';")) {
      content = content.replace(
        /import \{ component\$, useSignal, \$ \} from '@builder\.io\/qwik';/,
        "import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';"
      );
    } else if (content.includes("import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';")) {
      content = content.replace(
        /import \{ component\$, useSignal, useTask\$, \$ \} from '@builder\.io\/qwik';/,
        "import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';"
      );
    } else if (content.includes("import { component$, useSignal } from '@builder.io/qwik';")) {
      content = content.replace(
        /import \{ component\$, useSignal \} from '@builder\.io\/qwik';/,
        "import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';"
      );
    }
  }
  
  // Add import for getWebAppSchema
  if (!content.includes('getWebAppSchema')) {
    if (content.includes("import { useTranslate } from '../i18n-qwik/useTranslate';")) {
      content = content.replace(
        /import \{ useTranslate \} from '\.\.\/i18n-qwik\/useTranslate';/,
        "import { useTranslate } from '../i18n-qwik/useTranslate';\nimport { getWebAppSchema } from '../utils/webAppSchema';"
      );
    }
  }
  
  // Determine where to insert the schema code
  // Option 1: If there's pathParts pattern, insert after it
  const pathPartsPattern = /const pathParts = loc\.url\.pathname\.split\('\/'\)\.filter\(p => p\);/;
  
  // Option 2: Insert before return statement (for calculators without pathParts)
  const returnPattern = /(\s+)return \(/;
  
  let inserted = false;
  
  // Try to find pathParts pattern first
  if (pathPartsPattern.test(content)) {
    const mathCalcPathPattern = /const mathCalcPath = locale === 'en' \? '\/calculators\/math-calculators' : `\/\$\{locale\}\/calculators\/math-calculators`;\s*\n\s*return \(/;
    
    if (mathCalcPathPattern.test(content)) {
      const schemaCode = `
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.${calculatorKey}.title');
  const calculatorDescription = t('calculators.${calculatorKey}.seo.description');
  
  // Add WebApplication schema JSON-LD to head
  useVisibleTask$(() => {
    const webAppSchema = getWebAppSchema(locale, loc.url.href, calculatorName, calculatorDescription);
    
    const existingWebAppScript = document.querySelector('script[data-webapp-schema]');
    if (existingWebAppScript) {
      existingWebAppScript.remove();
    }
    
    const webAppScript = document.createElement('script');
    webAppScript.type = 'application/ld+json';
    webAppScript.setAttribute('data-webapp-schema', 'true');
    webAppScript.textContent = JSON.stringify(webAppSchema);
    document.head.appendChild(webAppScript);
  });
`;
      content = content.replace(mathCalcPathPattern, `const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : \`/\${locale}/calculators/math-calculators\`;${schemaCode}\n$1  return (`);
      inserted = true;
    }
  }
  
  // If no pathParts, insert before return with locale detection
  if (!inserted && returnPattern.test(content)) {
    const schemaCode = `
  
  // Get locale from URL path
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.${calculatorKey}.title');
  const calculatorDescription = t('calculators.${calculatorKey}.seo.description');
  
  // Add WebApplication schema JSON-LD to head
  useVisibleTask$(() => {
    const webAppSchema = getWebAppSchema(locale, loc.url.href, calculatorName, calculatorDescription);
    
    const existingWebAppScript = document.querySelector('script[data-webapp-schema]');
    if (existingWebAppScript) {
      existingWebAppScript.remove();
    }
    
    const webAppScript = document.createElement('script');
    webAppScript.type = 'application/ld+json';
    webAppScript.setAttribute('data-webapp-schema', 'true');
    webAppScript.textContent = JSON.stringify(webAppSchema);
    document.head.appendChild(webAppScript);
  });
`;
    content = content.replace(returnPattern, `${schemaCode}$1return (`);
    inserted = true;
  }
  
  if (inserted) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${file} (key: ${calculatorKey})`);
    updated++;
  } else {
    console.log(`⚠ Could not find insertion point in ${file}`);
    errors++;
  }
});

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
