#!/usr/bin/env node

/**
 * Qwik Migration Helper Script
 * 
 * This script helps automate the migration of Vue components to Qwik.
 * It generates Qwik component templates from Vue components.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  vueComponentsDir: path.join(rootDir, 'src/views/calculators'),
  qwikComponentsDir: path.join(rootDir, 'src-qwik/components'),
  qwikRoutesDir: path.join(rootDir, 'src-qwik/routes/calculators'),
  localesDir: path.join(rootDir, 'src/locales'),
  supportedLocales: ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh']
};

/**
 * Convert Vue component name to Qwik component name
 */
function toQwikComponentName(vueName) {
  // Remove .vue extension and convert to PascalCase if needed
  return vueName.replace(/\.vue$/, '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Convert Vue component name to route path
 */
function toRoutePath(componentName) {
  return componentName
    .replace(/\.vue$/, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Extract template content from Vue file
 */
function extractTemplate(vueContent) {
  const templateMatch = vueContent.match(/<template>([\s\S]*?)<\/template>/);
  return templateMatch ? templateMatch[1].trim() : '';
}

/**
 * Extract script content from Vue file
 */
function extractScript(vueContent) {
  const scriptMatch = vueContent.match(/<script>([\s\S]*?)<\/script>/s) || 
                     vueContent.match(/<script\s+[^>]*>([\s\S]*?)<\/script>/s);
  return scriptMatch ? scriptMatch[1].trim() : '';
}

/**
 * Extract style content from Vue file
 */
function extractStyle(vueContent) {
  const styleMatch = vueContent.match(/<style[^>]*>([\s\S]*?)<\/style>/s);
  return styleMatch ? styleMatch[1].trim() : '';
}

/**
 * Generate Qwik component template
 */
function generateQwikComponent(vueComponentName, vueContent) {
  const componentName = toQwikComponentName(vueComponentName);
  const routePath = toRoutePath(vueComponentName);
  
  // Extract parts
  const template = extractTemplate(vueContent);
  const script = extractScript(vueContent);
  const style = extractStyle(vueContent);
  
  // Basic Qwik component template
  const qwikComponent = `import { component$, useSignal, $ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n/useTranslate';

export default component$(() => {
  // TODO: Convert Vue data() to useSignal
  // TODO: Convert Vue methods to $ functions
  // TODO: Convert Vue computed to useTask$ / useComputed$
  // TODO: Convert Vue lifecycle hooks (mounted, etc.) to useTask$ / useVisibleTask$
  
  const t = useTranslate();
  const loc = useLocation();
  
  // State (convert from Vue data)
  // Example: const value = useSignal<number | null>(null);
  
  // Computed (convert from Vue computed)
  // Example: useTask$(({ track }) => { track(() => value.value); ... });
  
  // Methods (convert from Vue methods)
  // Example: const calculate = $(() => { ... });
  
  return (
    <div class="calculator-page">
      {/* TODO: Convert Vue template to Qwik JSX */}
      {/* 
        Vue → Qwik conversions:
        - v-model="value" → value={value.value ?? ''} onInput$={(e) => value.value = e.target.value}
        - @click="method" → onClick$={method}
        - @keyup.enter="method" → onKeyUp$={(e) => e.key === 'Enter' && method()}
        - :class="{ active: condition }" → class={condition ? 'active' : ''}
        - v-if="condition" → {condition && <div>...</div>}
        - v-for="item in items" → {items.map(item => <div key={item.id}>...</div>)}
        - {{ $t('key') }} → {t('key')}
        - router-link :to="path" → Link href={path}
        - $route → useLocation()
        - $i18n.locale → useTranslate() and useLocation()
      */}
      <div class="container">
        <div class="calculator-header">
          <div class="header-content">
            <div class="title-badge">{t('calculators.${routePath}.badge')}</div>
            <h1 class="page-title">{t('calculators.${routePath}.title')}</h1>
            <p class="page-description">{t('calculators.${routePath}.description')}</p>
          </div>
        </div>
        {/* Original Vue template content needs manual conversion */}
        {/* Template: ${template.substring(0, 200)}... */}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: '${componentName} - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: '${componentName} calculator',
    },
  ],
};
`;

  return qwikComponent;
}

/**
 * Generate Qwik route file
 */
function generateQwikRoute(componentName, routePath) {
  const qwikComponentName = toQwikComponentName(componentName);
  const routeFile = `import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ${qwikComponentName} from '../../components/${qwikComponentName}';

export default component$(() => {
  return <${qwikComponentName} />;
});

export const head: DocumentHead = {
  title: '${qwikComponentName} - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: '${qwikComponentName} calculator',
    },
  ],
};
`;

  return routeFile;
}

/**
 * Process a single Vue component
 */
function processComponent(vueFilePath) {
  const vueFileName = path.basename(vueFilePath);
  const componentName = vueFileName.replace(/\.vue$/, '');
  
  console.log(`Processing: ${vueFileName}`);
  
  // Read Vue component
  const vueContent = fs.readFileSync(vueFilePath, 'utf-8');
  
  // Generate Qwik component
  const qwikComponent = generateQwikComponent(vueFileName, vueContent);
  const qwikComponentName = toQwikComponentName(vueFileName);
  const qwikComponentPath = path.join(config.qwikComponentsDir, `${qwikComponentName}.tsx`);
  
  // Write Qwik component
  if (!fs.existsSync(config.qwikComponentsDir)) {
    fs.mkdirSync(config.qwikComponentsDir, { recursive: true });
  }
  fs.writeFileSync(qwikComponentPath, qwikComponent);
  console.log(`  ✅ Generated: ${qwikComponentPath}`);
  
  // Generate route
  const routePath = toRoutePath(componentName);
  const routeDir = path.join(config.qwikRoutesDir, routePath);
  const routeFilePath = path.join(routeDir, 'index.tsx');
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  const routeFile = generateQwikRoute(componentName, routePath);
  fs.writeFileSync(routeFilePath, routeFile);
  console.log(`  ✅ Generated route: ${routeFilePath}`);
  
  return { componentName, qwikComponentName, routePath };
}

/**
 * List all Vue components
 */
function listVueComponents() {
  if (!fs.existsSync(config.vueComponentsDir)) {
    console.error(`Vue components directory not found: ${config.vueComponentsDir}`);
    return [];
  }
  
  return fs.readdirSync(config.vueComponentsDir)
    .filter(file => file.endsWith('.vue'))
    .map(file => path.join(config.vueComponentsDir, file));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const componentName = args[0]; // Optional: specific component name
  
  console.log('🚀 Qwik Migration Helper\n');
  
  if (componentName) {
    // Process single component
    const vueFilePath = path.join(config.vueComponentsDir, `${componentName}.vue`);
    if (!fs.existsSync(vueFilePath)) {
      console.error(`Component not found: ${vueFilePath}`);
      process.exit(1);
    }
    processComponent(vueFilePath);
  } else {
    // Process all components
    const vueComponents = listVueComponents();
    console.log(`Found ${vueComponents.length} Vue components\n`);
    
    const results = [];
    for (const vueFile of vueComponents) {
      try {
        const result = processComponent(vueFile);
        results.push(result);
      } catch (error) {
        console.error(`  ❌ Error processing ${vueFile}:`, error.message);
      }
    }
    
    console.log(`\n✅ Generated ${results.length} Qwik components`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review generated components in ${config.qwikComponentsDir}`);
    console.log(`2. Manually convert Vue template syntax to Qwik JSX`);
    console.log(`3. Convert Vue reactive code (data, methods, computed) to Qwik`);
    console.log(`4. Test each component`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processComponent, generateQwikComponent, toQwikComponentName, toRoutePath };


