import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import VoltsToKwCalculator from '../../components/VoltsToKwCalculator';

export default component$(() => {
  return <VoltsToKwCalculator />;
});

export const head: DocumentHead = {
  title: 'VoltsToKwCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'VoltsToKwCalculator calculator',
    },
  ],
};
