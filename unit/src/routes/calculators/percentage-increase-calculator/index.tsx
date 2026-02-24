import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PercentageIncreaseCalculator from '../../components-qwik/PercentageIncreaseCalculator';

export default component$(() => {
  return <PercentageIncreaseCalculator />;
});

export const head: DocumentHead = {
  title: 'PercentageIncreaseCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PercentageIncreaseCalculator calculator',
    },
  ],
};
