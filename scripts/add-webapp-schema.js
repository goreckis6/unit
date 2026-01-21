/**
 * Script to automatically add WebApplication schema to all calculator components
 * This script adds the necessary imports and useVisibleTask$ hook to each calculator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, '../src/components-qwik');
const files = fs.readdirSync(componentsDir);

// List of calculators that already have WebApplication schema
const alreadyDone = [
  'FactorialCalculator.tsx',
  'SquareRootCalculator.tsx',
  'AdditionCalculator.tsx',
  'SubtractionCalculator.tsx',
  'MultiplicationCalculator.tsx',
  'DivisionCalculator.tsx',
  'SquareCalculator.tsx',
  'CubeCalculator.tsx',
  'PercentageCalculator.tsx',
  'PercentageChangeCalculator.tsx',
  'AverageCalculator.tsx',
  'SubtractingFractionsCalculator.tsx',
  'AbsoluteValueCalculator.tsx',
  'AntilogCalculator.tsx',
  'ArccosCalculator.tsx',
  'ArcsinCalculator.tsx',
  'ArctanCalculator.tsx',
];

// Exclude non-calculator files
const exclude = ['Navbar.tsx', 'Footer.tsx', 'MathCalculators.tsx', 'ElectricalCalculator.tsx'];

const calculatorFiles = files.filter(file => 
  file.endsWith('Calculator.tsx') && 
  !alreadyDone.includes(file) && 
  !exclude.includes(file)
);

console.log(`Found ${calculatorFiles.length} calculator files to update`);

calculatorFiles.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has getWebAppSchema
  if (content.includes('getWebAppSchema')) {
    console.log(`Skipping ${file} - already has WebApplication schema`);
    return;
  }
  
  // Extract calculator key from file name (e.g., CeilingCalculator -> ceiling)
  const calculatorKey = file.replace('Calculator.tsx', '').replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
  
  // Add import for useVisibleTask$ if not present
  if (!content.includes('useVisibleTask$')) {
    content = content.replace(
      /import \{ component\$, useSignal, useTask\$, \$ \} from '@builder\.io\/qwik';/,
      "import { component$, useSignal, useTask$, useVisibleTask$, $ } from '@builder.io/qwik';"
    );
  }
  
  // Add import for getWebAppSchema
  if (!content.includes('getWebAppSchema')) {
    content = content.replace(
      /import \{ useTranslate \} from '\.\.\/i18n-qwik\/useTranslate';/,
      "import { useTranslate } from '../i18n-qwik/useTranslate';\nimport { getWebAppSchema } from '../utils/webAppSchema';"
    );
  }
  
  // Find the pattern where we need to add the schema code
  const pathPartsPattern = /const pathParts = loc\.url\.pathname\.split\('\/'\)\.filter\(p => p\);/;
  
  if (pathPartsPattern.test(content)) {
    // Find the return statement after pathParts
    const returnPattern = /const mathCalcPath = locale === 'en' \? '\/calculators\/math-calculators' : `\/\$\{locale\}\/calculators\/math-calculators`;\s*\n\s*return \(/;
    
    if (returnPattern.test(content)) {
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
      
      content = content.replace(returnPattern, `const mathCalcPath = locale === 'en' ? '/calculators/math-calculators' : \`/\${locale}/calculators/math-calculators\`;${schemaCode}\n  return (`);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${file}`);
    } else {
      console.log(`⚠ Could not find insertion point in ${file}`);
    }
  } else {
    console.log(`⚠ Could not find pathParts pattern in ${file}`);
  }
});

console.log('\nDone!');
