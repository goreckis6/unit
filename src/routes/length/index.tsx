import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Layout from '../../components/layout';
import ConverterBase from '../../components/converter-base';

export const head: DocumentHead = {
  title: 'Length Converter - UnitConverterHub',
  meta: [
    {
      name: 'description',
      content: 'Convert between meters, feet, inches, kilometers, miles, centimeters, millimeters and more length units.',
    },
  ],
};

export default component$(() => {
  const lengthUnits = [
    { name: 'Meter', value: 1, symbol: 'm' },
    { name: 'Kilometer', value: 1000, symbol: 'km' },
    { name: 'Centimeter', value: 0.01, symbol: 'cm' },
    { name: 'Millimeter', value: 0.001, symbol: 'mm' },
    { name: 'Mile', value: 1609.344, symbol: 'mi' },
    { name: 'Yard', value: 0.9144, symbol: 'yd' },
    { name: 'Foot', value: 0.3048, symbol: 'ft' },
    { name: 'Inch', value: 0.0254, symbol: 'in' },
    { name: 'Nautical Mile', value: 1852, symbol: 'nmi' },
  ];

  return (
    <Layout>
      <div class="container">
        <ConverterBase
          title="Length Converter"
          description="Convert between different units of length including meters, feet, inches, kilometers, miles, and more."
          units={lengthUnits}
          baseUnit="meter"
        />
      </div>
    </Layout>
  );
});
