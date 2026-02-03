import { Calculator } from './types';

export const conversionCalculators: Calculator[] = [
  {
    id: 'kelvin-to-celsius',
    titleKey: 'kelvinToCelsius.title',
    descKey: 'kelvinToCelsius.description',
    path: '/calculators/conversion/kelvin-to-celsius',
    category: 'conversion',
  },
  {
    id: 'uppercase-to-lowercase',
    titleKey: 'uppercaseToLowercase.title',
    descKey: 'uppercaseToLowercase.description',
    path: '/calculators/conversion/uppercase-to-lowercase',
    category: 'conversion',
  },
];
