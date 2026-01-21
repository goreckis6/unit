import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Layout from '../../components/layout';
import ConverterBase from '../../components/converter-base';

export const head: DocumentHead = {
  title: 'Weight Converter - UnitConverterHub',
  meta: [
    {
      name: 'description',
      content: 'Convert between kilograms, pounds, ounces, grams, tons and more weight units.',
    },
  ],
};

export default component$(() => {
  const weightUnits = [
    { name: 'Kilogram', value: 1, symbol: 'kg' },
    { name: 'Gram', value: 0.001, symbol: 'g' },
    { name: 'Milligram', value: 0.000001, symbol: 'mg' },
    { name: 'Metric Ton', value: 1000, symbol: 't' },
    { name: 'Pound', value: 0.453592, symbol: 'lb' },
    { name: 'Ounce', value: 0.0283495, symbol: 'oz' },
    { name: 'Stone', value: 6.35029, symbol: 'st' },
    { name: 'US Ton', value: 907.185, symbol: 'US ton' },
    { name: 'UK Ton', value: 1016.05, symbol: 'UK ton' },
  ];

  return (
    <Layout>
      <div class="container">
        <ConverterBase
          title="Weight Converter"
          description="Convert between different units of weight including kilograms, pounds, ounces, grams, and more."
          units={weightUnits}
          baseUnit="kilogram"
        />
      </div>
    </Layout>
  );
});
