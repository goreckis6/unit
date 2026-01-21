import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WattToKwhCalculator from '../../components/WattToKwhCalculator';

export default component$(() => {
  return <WattToKwhCalculator />;
});

export const head: DocumentHead = {
  title: 'WattToKwhCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WattToKwhCalculator calculator',
    },
  ],
};
