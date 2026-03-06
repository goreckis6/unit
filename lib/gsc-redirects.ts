/**
 * Redirect map for GSC 404 URLs → correct paths.
 * Old slugs (from previous site) or non-existent pages → existing calculator paths or category index.
 */
export const SLUG_TO_PATH: Record<string, string> = {
  // electric
  'amps-to-kva-calculator': '/calculators/electric/amp-to-kva',
  'amps-to-va-calculator': '/calculators/electric/amps-to-va',
  'amps-to-volts-calculator': '/calculators/electric/amps-to-volt',
  'amps-to-kilowatts-calculator': '/calculators/electric/amp-to-kw',
  'amps-to-watts-calculator': '/calculators/electric/amps-to-watts',
  'amps-to-volts': '/calculators/electric/amps-to-volt',
  'watt-to-kva-calculator': '/calculators/electric/watts-to-kva',
  'watt-to-va-calculator': '/calculators/electric/watts-to-va',
  'watt-to-kwh-calculator': '/calculators/electric/watts-to-kwh',
  'kw-to-va-calculator': '/calculators/electric/kw-to-va',
  'kw-to-kva-calculator': '/calculators/electric/kw-to-kva',
  'kw-to-volts-calculator': '/calculators/electric/kw-to-volts',
  'kw-to-kwh-calculator': '/calculators/electric/kw-to-kwh',
  'kw-to-amps-calculator': '/calculators/electric/kw-to-amps',
  'kwh-to-watts-calculator': '/calculators/electric/kwh-to-watts',
  'kwh-to-kw-calculator': '/calculators/electric/kwh-to-kw',
  'mah-to-wh-calculator': '/calculators/electric/mah-to-wh',
  'wh-to-mah-calculator': '/calculators/electric/wh-to-mah',
  'kva-to-kw-calculator': '/calculators/electric/kva-to-kw',
  'kva-to-watts-calculator': '/calculators/electric/kva-to-watts',
  'kva-to-va-calculator': '/calculators/electric/kva-to-va',
  'kva-to-amps-calculator': '/calculators/electric/kva-to-amps',
  'ev-to-volts-calculator': '/calculators/electric/electron-volts-to-volts',
  'ev-to-volts': '/calculators/electric/electron-volts-to-volts',
  'joules-to-volts-calculator': '/calculators/electric/joules-to-volts',
  'joules-to-watts-calculator': '/calculators/electric/joules-to-watts',
  'electrical-calculator': '/calculators/electric',
  'electricity-bill-calculator': '/calculators/electric',
  'energy-consumption-calculator': '/calculators/electric',
  'ohms-law-calculator': '/calculators/electric',
  // math
  'ratio-calculator': '/calculators/math/ratio',
  'remainder-calculator': '/calculators/math/remainder',
  'polynomial-remainder-calculator': '/calculators/math/polynomial-remainder',
  'percentage-increase-calculator': '/calculators/math/percentage-increase',
  'natural-logarithm-calculator': '/calculators/math/natural-logarithm',
  'square-root-calculator': '/calculators/math/square-root',
  'anti-log-calculator': '/calculators/math/antilog',
  'arccos-calculator': '/calculators/math/arccos',
  'arcsin-calculator': '/calculators/math/arcsin',
  'arctan-calculator': '/calculators/math/arctan',
  'convolution-calculator': '/calculators/math/convolution',
  'sin-calculator': '/calculators/math/sine',
  'cosine-calculator': '/calculators/math/cosine',
  'fraction': '/calculators/math/fraction-to-decimal',
  'simplifying-fractions': '/calculators/math/equivalent-fractions',
  'long-multiplication-calculator': '/calculators/math/long-multiplication',
  'multiplying-fractions-calculator': '/calculators/math/multiplying-fractions',
  'adding-fractions-calculator': '/calculators/math/adding-fractions',
  'adding-fractions': '/calculators/math/adding-fractions',
  'subtracting-fractions': '/calculators/math/subtracting-fractions',
  'kinetic-energy-calculator': '/calculators/math/kinetic-energy',
  'lcm-calculator': '/calculators/math/lcm',
  'gcf-calculator': '/calculators/math/gcf',
  'percent-error-calculator': '/calculators/math/percent-error',
  'quadratic-equation-calculator': '/calculators/math/quadratic-equation',
  'pythagorean-theorem-calculator': '/calculators/math/pythagorean-theorem',
  'roots-calculator': '/calculators/math/roots',
  'random-numbers-generator': '/calculators/math',
  'math-calculators': '/calculators/math',
  // conversion
  'celsius-to-kelvin': '/calculators/conversion/kelvin-to-celsius',
  'kelvin-to-celsius': '/calculators/conversion/kelvin-to-celsius',
  // health (redirect to category - pages not in lib)
  'bmi-calculator': '/calculators/health',
  'calorie-calculator': '/calculators/health',
  'body-fat-calculator': '/calculators/health',
  // others
  'blog': '/',
};

/**
 * Resolve a calculator path to its canonical URL.
 * If the path uses an old slug that redirects, returns the destination path.
 * Use this when building Link hrefs so prefetch hits the real page, not a redirect.
 */
export function resolveCalculatorPath(path: string): string {
  const full = path.startsWith('/') ? path : `/${path}`;
  const normalized = full.replace(/^\/calculators\//, '').replace(/\/$/, '');
  const parts = normalized.split('/');
  const slug = parts[parts.length - 1];
  if (slug && slug in SLUG_TO_PATH) {
    const dest = SLUG_TO_PATH[slug];
    return dest.startsWith('/') ? dest : `/${dest}`;
  }
  return full.startsWith('/') ? full : `/${full}`;
}
