import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KvaToKwCalculator from '../../components-qwik/KvaToKwCalculator';

export default component$(() => {
  return <KvaToKwCalculator />;
});

export const head: DocumentHead = {
  title: 'KvaToKwCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KvaToKwCalculator calculator',
    },
  ],
};
