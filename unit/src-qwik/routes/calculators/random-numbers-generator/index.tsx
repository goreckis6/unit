import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import RandomNumbersGenerator from '../../components/RandomNumbersGenerator';

export default component$(() => {
  return <RandomNumbersGenerator />;
});

export const head: DocumentHead = {
  title: 'RandomNumbersGenerator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'RandomNumbersGenerator calculator',
    },
  ],
};
