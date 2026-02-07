import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ExponentialGrowthCalculator from '../../components/ExponentialGrowthCalculator';

export default component$(() => {
  return <ExponentialGrowthCalculator />;
});

export const head: DocumentHead = {
  title: 'ExponentialGrowthCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ExponentialGrowthCalculator calculator',
    },
  ],
};
