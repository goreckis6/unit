import { Calculator } from './calculators/types';
import { mathCalculators } from './calculators/math';
import { electricCalculators } from './calculators/electric';
import { biologyCalculators } from './calculators/biology';
import { conversionCalculators } from './calculators/conversion';
import { physicsCalculators } from './calculators/physics';
import { financeCalculators } from './calculators/finance';
import { otherCalculators } from './calculators/others';

export type { Calculator };

export function getAllCalculators(): Calculator[] {
  return [
    ...mathCalculators,
    ...electricCalculators,
    ...biologyCalculators,
    ...conversionCalculators,
    ...physicsCalculators,
    ...financeCalculators,
    ...otherCalculators,
  ];
}

// Export individual calculator arrays for use in category pages
export { mathCalculators, electricCalculators, biologyCalculators, conversionCalculators, physicsCalculators, financeCalculators, otherCalculators };
