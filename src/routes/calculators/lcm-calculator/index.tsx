import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import LcmCalculator from '../../components-qwik/LcmCalculator';

export default component$(() => {
  return <LcmCalculator />;
});

export const head: DocumentHead = {
  title: 'LcmCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'LcmCalculator calculator',
    },
  ],
};
