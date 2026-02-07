import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import RemainderCalculator from '../../components/RemainderCalculator';

export default component$(() => {
  return <RemainderCalculator />;
});

export const head: DocumentHead = {
  title: 'RemainderCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'RemainderCalculator calculator',
    },
  ],
};
