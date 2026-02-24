import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwToVaCalculator from '../../components/KwToVaCalculator';

export default component$(() => {
  return <KwToVaCalculator />;
});

export const head: DocumentHead = {
  title: 'KwToVaCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwToVaCalculator calculator',
    },
  ],
};
