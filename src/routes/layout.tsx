import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import Navbar from '../components-qwik/Navbar';
import Footer from '../components-qwik/Footer';
import { getWebAppSchema } from '../utils/webAppSchema';

export default component$(() => {
  const loc = useLocation();
  
  // Get locale from URL path
  const pathParts = loc.url.pathname.split('/').filter(p => p);
  const supportedLocales = ['en', 'pl', 'sv', 'de', 'es', 'fr', 'it', 'nl', 'pt', 'vi', 'tr', 'ru', 'fa', 'th', 'ja', 'zh'];
  const locale = pathParts[0] && supportedLocales.includes(pathParts[0]) ? pathParts[0] : 'en';
  
  // Add WebApplication schema JSON-LD to head
  useVisibleTask$(() => {
    const webAppSchema = getWebAppSchema(locale, loc.url.href);
    
    // Remove existing WebApplication schema if any
    const existingScript = document.querySelector('script[data-webapp-schema]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new WebApplication schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-webapp-schema', 'true');
    script.textContent = JSON.stringify(webAppSchema);
    document.head.appendChild(script);
  });
  
  return (
    <div class="app">
      <Navbar />
      <main>
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
