import { Calculator } from './calculators/types';
import { mathCalculators } from './calculators/math';
import { electricCalculators } from './calculators/electric';
import { biologyCalculators } from './calculators/biology';
import { conversionCalculators } from './calculators/conversion';
import { physicsCalculators } from './calculators/physics';
import { realLifeCalculators } from './calculators/real-life';
import { financeCalculators } from './calculators/finance';
import { otherCalculators } from './calculators/others';
import { healthCalculators } from './calculators/health';
import { chemistryCalculators } from './calculators/chemistry';
import { constructionCalculators } from './calculators/construction';
import { ecologyCalculators } from './calculators/ecology';
import { foodCalculators } from './calculators/food';
import { statisticsCalculators } from './calculators/statistics';

export type { Calculator };

export function getAllCalculators(): Calculator[] {
  return [
    ...mathCalculators,
    ...electricCalculators,
    ...biologyCalculators,
    ...conversionCalculators,
    ...physicsCalculators,
    ...realLifeCalculators,
    ...financeCalculators,
    ...otherCalculators,
    ...healthCalculators,
    ...chemistryCalculators,
    ...constructionCalculators,
    ...ecologyCalculators,
    ...foodCalculators,
    ...statisticsCalculators,
  ];
}

// Export individual calculator arrays for use in category pages
export { 
  mathCalculators, 
  electricCalculators, 
  biologyCalculators, 
  conversionCalculators, 
  physicsCalculators, 
  realLifeCalculators, 
  financeCalculators, 
  otherCalculators,
  healthCalculators,
  chemistryCalculators,
  constructionCalculators,
  ecologyCalculators,
  foodCalculators,
  statisticsCalculators,
};
