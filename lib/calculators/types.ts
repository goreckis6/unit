export interface Calculator {
  id: string;
  titleKey: string;
  descKey: string;
  path: string;
  category: 'math' | 'electric' | 'biology' | 'conversion' | 'physics' | 'real-life' | 'finance' | 'others';
}
