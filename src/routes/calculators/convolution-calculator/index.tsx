import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import ConvolutionCalculator from "../../../components/convolution-calculator";

export default component$(() => {
  return <ConvolutionCalculator />;
});

export const head: DocumentHead = {
  title: 'ConvolutionCalculator - Unit Converter Hub',
  meta: [
    {
      name: 'description',
      content: 'ConvolutionCalculator calculator',
    },
  ],
};
