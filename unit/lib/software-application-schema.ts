/**
 * Generates SoftwareApplication structured data (JSON-LD)
 * @param locale Current locale
 * @param siteName Site name
 * @param description Site description
 * @param url Site URL
 * @returns JSON-LD schema object for SoftwareApplication
 */
export function getSoftwareApplicationSchema(
  locale: string,
  siteName: string,
  description: string,
  url: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName,
    description: description,
    url: url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    inLanguage: locale,
    featureList: [
      'Free online calculators',
      'Multiple calculator categories',
      'Instant calculations',
      'No registration required',
      'Mobile-friendly interface',
      '16 languages support',
    ],
  };
}
