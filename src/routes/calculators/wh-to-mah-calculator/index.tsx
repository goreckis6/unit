import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import WhToMahCalculator from '../../components-qwik/WhToMahCalculator';

export default component$(() => {
  return <WhToMahCalculator />;
});

export const head: DocumentHead = {
  title: 'WhToMahCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'WhToMahCalculator calculator',
    },
  ],
};
