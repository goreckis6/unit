// SEO utilities for hreflang and meta tags

// Helper function to generate path with locale prefix (en has no prefix)
function getLocalePath(locale, path) {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}

export function updateHreflangTags(currentPath, supportedLocales) {
  // Remove existing hreflang tags
  const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]')
  existingHreflang.forEach(tag => tag.remove())

  // Get base URL
  const baseUrl = window.location.origin
  
  // Extract path without locale
  const pathParts = currentPath.split('/').filter(p => p)
  const hasLocalePrefix = pathParts[0] && supportedLocales.includes(pathParts[0])
  const pathWithoutLocale = hasLocalePrefix ? '/' + pathParts.slice(1).join('/') : currentPath

  // Add hreflang tags for all supported locales
  supportedLocales.forEach(locale => {
    const localePath = getLocalePath(locale, pathWithoutLocale)
    const fullUrl = baseUrl + localePath

    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', locale)
    link.setAttribute('href', fullUrl)
    document.head.appendChild(link)
  })

  // Add x-default hreflang (pointing to English without /en prefix)
  const defaultPath = pathWithoutLocale
  const defaultUrl = baseUrl + defaultPath
  const defaultLink = document.createElement('link')
  defaultLink.setAttribute('rel', 'alternate')
  defaultLink.setAttribute('hreflang', 'x-default')
  defaultLink.setAttribute('href', defaultUrl)
  document.head.appendChild(defaultLink)
}

export function updateCanonicalTag(currentPath) {
  // Remove existing canonical tag
  const existingCanonical = document.querySelector('link[rel="canonical"]')
  if (existingCanonical) {
    existingCanonical.remove()
  }

  // Create new canonical tag
  const baseUrl = window.location.origin
  const canonicalUrl = baseUrl + currentPath

  const link = document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', canonicalUrl)
  document.head.appendChild(link)
}

