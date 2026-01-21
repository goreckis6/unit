import { component$, useSignal, $ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { useTranslate } from '../i18n-qwik/useTranslate';
import { getWebAppSchema } from '../utils/webAppSchema';

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
  
  // Get locale from URL path
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  
  // Get calculator name and description for WebApplication schema
  const calculatorName = t('calculators.convolution-calculator.title');
  const calculatorDescription = t('calculators.convolution-calculator.seo.description');
  
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
            <div class="title-badge">{t('calculators.convolution-calculator.badge')}</div>
            <h1 class="page-title">{t('calculators.convolution-calculator.title')}</h1>
            <p class="page-description">{t('calculators.convolution-calculator.description')}</p>
          </div>
        </div>
        {/* Original Vue template content needs manual conversion */}
        {/* Template: <div class="calculator-page">
    <Navbar />
    
    <div class="page-background">
      <div class="bg-gradient"></div>
    </div>

    <div class="container">
      <div class="calculator-header">
... */}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'ConvolutionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ConvolutionCalculator calculator',
    },
  ],
};
