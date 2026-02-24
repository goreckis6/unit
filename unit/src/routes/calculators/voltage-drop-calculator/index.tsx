import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltageDropCalculator from '../../components-qwik/VoltageDropCalculator';

export default component$(() => {
  return <VoltageDropCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltageDropCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltageDropCalculator calculator',
    },
  ],
};
