/**
 * Generates WebApplication structured data (JSON-LD) for the main application or specific calculator
 * @param locale Current locale (default: 'en')
 * @param url Current page URL
 * @param name Optional application/calculator name (will use default if not provided)
 * @param description Optional description (will use default if not provided)
 * @returns JSON-LD schema object for WebApplication
 */
export function getWebAppSchema(
  locale: string = 'en', 
  url: string = '', 
  name?: string,
  description?: string
) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://unitconventerhub.com';
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : baseUrl);
  
  // Application name - use provided name or default
  const appName = name || 'Unit Converter Hub';

  // Default descriptions in different languages
  const defaultDescriptions: Record<string, string> = {
    en: 'Free online calculators and unit converters for math, electrical, and more. Fast, accurate, and easy to use.',
    pl: 'Darmowe kalkulatory online i konwertery jednostek dla matematyki, elektryki i więcej. Szybkie, dokładne i łatwe w użyciu.',
    de: 'Kostenlose Online-Rechner und Einheitenumrechner für Mathematik, Elektrik und mehr. Schnell, genau und einfach zu bedienen.',
    es: 'Calculadoras en línea gratuitas y convertidores de unidades para matemáticas, electricidad y más. Rápido, preciso y fácil de usar.',
    fr: 'Calculatrices en ligne gratuites et convertisseurs d\'unités pour les mathématiques, l\'électricité et plus encore. Rapide, précis et facile à utiliser.',
    it: 'Calcolatrici online gratuite e convertitori di unità per matematica, elettricità e altro ancora. Veloce, preciso e facile da usare.',
    nl: 'Gratis online rekenmachines en eenhedenconverters voor wiskunde, elektriciteit en meer. Snel, nauwkeurig en gemakkelijk te gebruiken.',
    pt: 'Calculadoras online gratuitas e conversores de unidades para matemática, elétrica e muito mais. Rápido, preciso e fácil de usar.',
    sv: 'Gratis online-kalkylatorer och enhetsomvandlare för matematik, el och mer. Snabb, noggrann och lätt att använda.',
    vi: 'Máy tính trực tuyến miễn phí và bộ chuyển đổi đơn vị cho toán học, điện và hơn thế nữa. Nhanh, chính xác và dễ sử dụng.',
    tr: 'Matematik, elektrik ve daha fazlası için ücretsiz online hesap makineleri ve birim dönüştürücüler. Hızlı, doğru ve kullanımı kolay.',
    ru: 'Бесплатные онлайн-калькуляторы и конвертеры единиц для математики, электричества и многого другого. Быстро, точно и легко в использовании.',
    fa: 'ماشین‌حساب‌های آنلاین رایگان و تبدیل‌کننده‌های واحد برای ریاضیات، برق و موارد دیگر. سریع، دقیق و آسان برای استفاده.',
    th: 'เครื่องคิดเลขออนไลน์ฟรีและตัวแปลงหน่วยสำหรับคณิตศาสตร์ ไฟฟ้า และอื่นๆ เร็ว แม่นยำ และใช้งานง่าย',
    ja: '数学、電気などに対応した無料のオンライン計算機と単位変換ツール。高速、正確、使いやすい。',
    zh: '免费的在线计算器和单位转换器，适用于数学、电气等。快速、准确且易于使用。',
  };

  const appDescription = description || defaultDescriptions[locale] || defaultDescriptions['en'];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: appName,
    url: currentUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: appDescription,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    inLanguage: locale,
    isAccessibleForFree: true,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  };
}
