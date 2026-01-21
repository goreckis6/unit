import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import LogCalculator from '../../components-qwik/LogCalculator';

export default component$(() => {
  return <LogCalculator />;
});

export const head: DocumentHead = {
  title: 'LogCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'LogCalculator calculator',
    },
  ],
};
