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
  {
    id: 'leet-speak-translator',
    titleKey: 'leetSpeak.title',
    descKey: 'leetSpeak.description',
    path: '/calculators/conversion/leet-speak-translator',
    category: 'conversion',
  },
];
