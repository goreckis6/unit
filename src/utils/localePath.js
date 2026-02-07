/**
 * Helper function to generate path with locale prefix (en has no prefix)
 * @param {string} locale - The locale code
 * @param {string} path - The path (should start with /)
 * @returns {string} - The path with locale prefix if needed
 */
export function getLocalePath(locale, path) {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}

/**
 * Get the home path for a locale
 * @param {string} locale - The locale code
 * @returns {string} - The home path
 */
export function getHomePath(locale) {
  if (locale === 'en') {
    return '/'
  }
  return `/${locale}/`
}





