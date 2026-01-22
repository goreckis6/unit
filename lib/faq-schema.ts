/**
 * Generates FAQPage structured data (JSON-LD) from FAQ items
 * @param faqItems Array of FAQ items with question and answer
 * @returns JSON-LD schema object for FAQPage
 */
export function getFaqSchema(faqItems: Array<{ question: string; answer: string }>) {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
