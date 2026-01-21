import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import MultiplyingFractions from '../../components-qwik/MultiplyingFractions';

export default component$(() => {
  return <MultiplyingFractions />;
});

export const head: DocumentHead = {
  title: 'MultiplyingFractions - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'MultiplyingFractions calculator',
    },
  ],
};
