import { Calculator, sortCalculatorsAlphabetically } from './types';

const mathCalculatorsList: Calculator[] = [
  {
    id: 'addition',
    titleKey: 'addition.title',
    descKey: 'addition.description',
    path: '/calculators/math/addition',
    category: 'math',
  },
  {
    id: 'adding-fractions',
    titleKey: 'addingFractions.title',
    descKey: 'addingFractions.description',
    path: '/calculators/math/adding-fractions',
    category: 'math',
  },
  {
    id: 'subtracting-fractions',
    titleKey: 'subtractingFractions.title',
    descKey: 'subtractingFractions.description',
    path: '/calculators/math/subtracting-fractions',
    category: 'math',
  },
  {
    id: 'antilog',
    titleKey: 'antilog.title',
    descKey: 'antilog.description',
    path: '/calculators/math/antilog',
    category: 'math',
  },
  {
    id: 'arccos',
    titleKey: 'arccos.title',
    descKey: 'arccos.description',
    path: '/calculators/math/arccos',
    category: 'math',
  },
  {
    id: 'cosine',
    titleKey: 'cosine.title',
    descKey: 'cosine.description',
    path: '/calculators/math/cosine',
    category: 'math',
  },
  {
    id: 'arcsin',
    titleKey: 'arcsin.title',
    descKey: 'arcsin.description',
    path: '/calculators/math/arcsin',
    category: 'math',
  },
  {
    id: 'arctan',
    titleKey: 'arctan.title',
    descKey: 'arctan.description',
    path: '/calculators/math/arctan',
    category: 'math',
  },
  {
    id: 'average',
    titleKey: 'average.title',
    descKey: 'average.description',
    path: '/calculators/math/average',
    category: 'math',
  },
  {
    id: 'percentage',
    titleKey: 'percentage.title',
    descKey: 'percentage.description',
    path: '/calculators/math/percentage',
    category: 'math',
  },
  {
    id: 'square-root',
    titleKey: 'squareRoot.title',
    descKey: 'squareRoot.description',
    path: '/calculators/math/square-root',
    category: 'math',
  },
  {
    id: 'convolution',
    titleKey: 'convolution.title',
    descKey: 'convolution.description',
    path: '/calculators/math/convolution',
    category: 'math',
  },
  {
    id: 'sine',
    titleKey: 'sine.title',
    descKey: 'sine.description',
    path: '/calculators/math/sine',
    category: 'math',
  },
];

export const mathCalculators: Calculator[] = sortCalculatorsAlphabetically(mathCalculatorsList);
