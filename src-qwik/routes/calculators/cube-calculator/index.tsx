import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import CubeCalculator from '../../components/CubeCalculator';

export default component$(() => {
  return <CubeCalculator />;
});

export const head: DocumentHead = {
  title: 'CubeCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'CubeCalculator calculator',
    },
  ],
};
