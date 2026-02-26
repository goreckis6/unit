export interface Calculator {
  id: string;
  titleKey: string;
  descKey: string;
  path: string;
  category: 'math' | 'electric' | 'biology' | 'conversion' | 'physics' | 'real-life' | 'finance' | 'others' | 'health' | 'chemistry' | 'construction' | 'ecology' | 'food' | 'statistics';
}

/** Sorts calculator array A–Z by id so newly added calcs appear in alphabetical order. */
export function sortCalculatorsAlphabetically(calculators: Calculator[]): Calculator[] {
  return [...calculators].sort((a, b) => {
    try {
      return (a.id ?? '').localeCompare(b.id ?? '', 'en');
    } catch {
      return (a.id ?? '') < (b.id ?? '') ? -1 : (a.id ?? '') > (b.id ?? '') ? 1 : 0;
    }
  });
}

/**
 * Adds one or more calculators to a list and returns the list sorted A–Z by id.
 * Use when adding new calculators to a category so the list stays alphabetical.
 * @example
 * const list = addCalculatorsSorted(existingList, {
 *   id: 'new-calculator',
 *   titleKey: 'newCalculator.title',
 *   descKey: 'newCalculator.description',
 *   path: '/calculators/others/new-calculator',
 *   category: 'others',
 * });
 */
export function addCalculatorsSorted(
  calculators: Calculator[],
  ...newCalculators: Calculator[]
): Calculator[] {
  return sortCalculatorsAlphabetically([...calculators, ...newCalculators]);
}
