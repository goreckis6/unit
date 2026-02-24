import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import AmpsToVoltsCalculator from '../../components/AmpsToVoltsCalculator';

export default component$(() => {
  return <AmpsToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'AmpsToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'AmpsToVoltsCalculator calculator',
    },
  ],
};
