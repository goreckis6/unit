import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PowerCalculator from '../../components/PowerCalculator';

export default component$(() => {
  return <PowerCalculator />;
});

export const head: DocumentHead = {
  title: 'PowerCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PowerCalculator calculator',
    },
  ],
};
