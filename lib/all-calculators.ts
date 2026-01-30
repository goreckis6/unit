import { Calculator } from './calculators/types';
import { mathCalculators } from './calculators/math';
import { electricCalculators } from './calculators/electric';
import { otherCalculators } from './calculators/others';

export type { Calculator };

export function getAllCalculators(): Calculator[] {
  return [
    ...mathCalculators,
    ...electricCalculators,
    ...otherCalculators,
  ];
}

// Export individual calculator arrays for use in category pages
export { mathCalculators, electricCalculators, otherCalculators };
