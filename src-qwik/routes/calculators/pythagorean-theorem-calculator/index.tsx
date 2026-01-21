import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PythagoreanTheoremCalculator from '../../components/PythagoreanTheoremCalculator';

export default component$(() => {
  return <PythagoreanTheoremCalculator />;
});

export const head: DocumentHead = {
  title: 'PythagoreanTheoremCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PythagoreanTheoremCalculator calculator',
    },
  ],
};
