import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import KwhToKwCalculator from '../../components/KwhToKwCalculator';

export default component$(() => {
  return <KwhToKwCalculator />;
});

export const head: DocumentHead = {
  title: 'KwhToKwCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'KwhToKwCalculator calculator',
    },
  ],
};
