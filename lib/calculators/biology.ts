import { Calculator } from './types';

export const biologyCalculators: Calculator[] = [
  {
    id: 'dna-to-mrna',
    titleKey: 'dnaToMrna.title',
    descKey: 'dnaToMrna.description',
    path: '/calculators/biology/dna-to-mrna',
    category: 'biology',
  },
  {
    id: 'dog-raisin-toxicity',
    titleKey: 'dogRaisinToxicity.title',
    descKey: 'dogRaisinToxicity.description',
    path: '/calculators/biology/dog-raisin-toxicity',
    category: 'biology',
  },
  {
    id: 'cat-pregnancy-calculator',
    titleKey: 'catPregnancy.title',
    descKey: 'catPregnancy.description',
    path: '/calculators/biology/cat-pregnancy-calculator',
    category: 'biology',
  },
];
