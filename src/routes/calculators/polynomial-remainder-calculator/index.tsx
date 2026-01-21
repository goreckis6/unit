import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import PolynomialRemainderCalculator from '../../components-qwik/PolynomialRemainderCalculator';

export default component$(() => {
  return <PolynomialRemainderCalculator />;
});

export const head: DocumentHead = {
  title: 'PolynomialRemainderCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'PolynomialRemainderCalculator calculator',
    },
  ],
};
