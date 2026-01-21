import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PercentageChangeCalculator from '../../components/PercentageChangeCalculator';

export default component$(() => {
  return <PercentageChangeCalculator />;
});

export const head: DocumentHead = {
  title: 'PercentageChangeCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PercentageChangeCalculator calculator',
    },
  ],
};
