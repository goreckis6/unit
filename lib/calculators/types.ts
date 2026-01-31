export interface Calculator {
  id: string;
  titleKey: string;
  descKey: string;
  path: string;
  category: 'math' | 'electric' | 'biology' | 'conversion' | 'physics' | 'real-life' | 'finance' | 'others';
}

/** Sorts calculator array A–Z by id so newly added calcs appear in alphabetical order. */
export function sortCalculatorsAlphabetically(calculators: Calculator[]): Calculator[] {
  return [...calculators].sort((a, b) => a.id.localeCompare(b.id, 'en'));
}
