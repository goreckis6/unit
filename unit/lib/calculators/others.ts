import { Calculator, addCalculatorsSorted } from './types';

/**
 * Others category calculators. When adding a new calculator, add a new entry
 * to the array below (any position). addCalculatorsSorted() keeps the list A–Z by id.
 */
const otherCalculatorsList: Calculator[] = addCalculatorsSorted(
  [
  {
    id: 'ascii-converter',
    titleKey: 'asciiConverter.title',
    descKey: 'asciiConverter.description',
    path: '/calculators/others/ascii-converter',
    category: 'others',
  },
  {
    id: 'bold-text',
    titleKey: 'boldText.title',
    descKey: 'boldText.description',
    path: '/calculators/others/bold-text',
    category: 'others',
  },
  {
    id: 'caesar-cipher',
    titleKey: 'caesarCipher.title',
    descKey: 'caesarCipher.description',
    path: '/calculators/others/caesar-cipher',
    category: 'others',
  },
  {
    id: 'italic-text',
    titleKey: 'italicText.title',
    descKey: 'italicText.description',
    path: '/calculators/others/italic-text',
    category: 'others',
  },
  {
    id: 'letters-to-numbers',
    titleKey: 'lettersToNumbers.title',
    descKey: 'lettersToNumbers.description',
    path: '/calculators/others/letters-to-numbers',
    category: 'others',
  },
  {
    id: 'mirror-text',
    titleKey: 'mirrorText.title',
    descKey: 'mirrorText.description',
    path: '/calculators/others/mirror-text',
    category: 'others',
  },
  {
    id: 'morse-code',
    titleKey: 'morseCode.title',
    descKey: 'morseCode.description',
    path: '/calculators/others/morse-code',
    category: 'others',
  },
  {
    id: 'nato-phonetic',
    titleKey: 'natoPhonetic.title',
    descKey: 'natoPhonetic.description',
    path: '/calculators/others/nato-phonetic',
    category: 'others',
  },
  {
    id: 'numbers-to-letters',
    titleKey: 'numbersToLetters.title',
    descKey: 'numbersToLetters.description',
    path: '/calculators/others/numbers-to-letters',
    category: 'others',
  },
  {
    id: 'pig-latin',
    titleKey: 'pigLatin.title',
    descKey: 'pigLatin.description',
    path: '/calculators/others/pig-latin',
    category: 'others',
  },
  {
    id: 'small-caps',
    titleKey: 'smallCaps.title',
    descKey: 'smallCaps.description',
    path: '/calculators/others/small-caps',
    category: 'others',
  },
  {
    id: 'text-to-binary',
    titleKey: 'textToBinary.title',
    descKey: 'textToBinary.description',
    path: '/calculators/others/text-to-binary',
    category: 'others',
  },
  {
    id: 'upside-down-text',
    titleKey: 'upsideDownText.title',
    descKey: 'upsideDownText.description',
    path: '/calculators/others/upside-down-text',
    category: 'others',
  },
  {
    id: 'vigenere-cipher',
    titleKey: 'vigenereCipher.title',
    descKey: 'vigenereCipher.description',
    path: '/calculators/others/vigenere-cipher',
    category: 'others',
  },
  {
    id: 'minecraft-circle-generator',
    titleKey: 'minecraftCircleGenerator.title',
    descKey: 'minecraftCircleGenerator.description',
    path: '/calculators/others/minecraft-circle-generator',
    category: 'others',
  },
  {
    id: 'mulch-calculator',
    titleKey: 'mulchCalculator.title',
    descKey: 'mulchCalculator.description',
    path: '/calculators/others/mulch-calculator',
    category: 'others',
  },
  // Add new others calculators here; list is sorted A–Z by id automatically.
  ],
);

export const otherCalculators = otherCalculatorsList;
