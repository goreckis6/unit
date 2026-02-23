/**
 * Calculators that have an /embed route (calculator only, no header/footer).
 * Add paths here when creating new embed pages.
 */
export const CALCULATOR_EMBED_PATHS = new Set([
  'math/adding-fractions',
  'math/addition',
  'math/subtracting-fractions',
  'math/multiplying-fractions',
]);

export function hasCalculatorEmbed(path: string): boolean {
  const normalized = path.replace(/^\//, '').replace(/^calculators\//, '');
  return CALCULATOR_EMBED_PATHS.has(normalized);
}
