/**
 * Helper function to add WebApplication schema to calculator pages
 * This should be called in useVisibleTask$ within calculator components
 * @param locale Current locale
 * @param calculatorKey Key in translations (e.g., 'calculators.factorial')
 * @param url Current page URL
 * @param t Translation function
 * @param getTranslation Function to get translation object
 */
import { getWebAppSchema } from './webAppSchema';

export function addWebAppSchemaToPage(
  locale: string,
  calculatorKey: string,
  url: string,
  t: (key: string) => string,
  getTranslation: (key: string) => any
) {
  try {
    // Get calculator name and description from translations
    const calculatorName = t(`${calculatorKey}.title`);
    const calculatorDescription = t(`${calculatorKey}.seo.description`);
    
    // Generate WebApplication schema
    const webAppSchema = getWebAppSchema(locale, url, calculatorName, calculatorDescription);
    
    // Remove existing WebApplication schema if any
    const existingWebAppScript = document.querySelector('script[data-webapp-schema]');
    if (existingWebAppScript) {
      existingWebAppScript.remove();
    }
    
    // Add new WebApplication schema
    const webAppScript = document.createElement('script');
    webAppScript.type = 'application/ld+json';
    webAppScript.setAttribute('data-webapp-schema', 'true');
    webAppScript.textContent = JSON.stringify(webAppSchema);
    document.head.appendChild(webAppScript);
  } catch (error) {
    console.warn('Failed to add WebApplication schema:', error);
  }
}
