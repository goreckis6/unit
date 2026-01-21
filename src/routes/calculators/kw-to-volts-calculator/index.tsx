import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToVoltsCalculator from '../../components-qwik/KwToVoltsCalculator';

export default component$(() => {
  return <KwToVoltsCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToVoltsCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToVoltsCalculator calculator',
    },
  ],
};
