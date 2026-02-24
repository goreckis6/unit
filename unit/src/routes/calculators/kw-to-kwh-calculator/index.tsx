import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToKwhCalculator from '../../components-qwik/KwToKwhCalculator';

export default component$(() => {
  return <KwToKwhCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToKwhCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToKwhCalculator calculator',
    },
  ],
};
