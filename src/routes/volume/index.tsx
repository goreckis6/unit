import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Layout from '../../components/layout';
import ConverterBase from '../../components/converter-base';

export const head: DocumentHead = {
  title: 'Volume Converter - UnitConverterHub',
  meta: [
    {
      name: 'description',
      content: 'Convert between liters, gallons, cubic meters, cups, milliliters and more volume units.',
    },
  ],
};

export default component$(() => {
  const volumeUnits = [
    { name: 'Liter', value: 1, symbol: 'L' },
    { name: 'Milliliter', value: 0.001, symbol: 'mL' },
    { name: 'Cubic Meter', value: 1000, symbol: 'm³' },
    { name: 'Cubic Centimeter', value: 0.001, symbol: 'cm³' },
    { name: 'US Gallon', value: 3.78541, symbol: 'gal' },
    { name: 'US Quart', value: 0.946353, symbol: 'qt' },
    { name: 'US Pint', value: 0.473176, symbol: 'pt' },
    { name: 'US Cup', value: 0.236588, symbol: 'cup' },
    { name: 'US Fluid Ounce', value: 0.0295735, symbol: 'fl oz' },
    { name: 'UK Gallon', value: 4.54609, symbol: 'UK gal' },
    { name: 'UK Pint', value: 0.568261, symbol: 'UK pt' },
    { name: 'Tablespoon', value: 0.0147868, symbol: 'tbsp' },
    { name: 'Teaspoon', value: 0.00492892, symbol: 'tsp' },
  ];

  return (
    <Layout>
      <div class="container">
        <ConverterBase
          title="Volume Converter"
          description="Convert between different units of volume including liters, gallons, cubic meters, cups, and more."
          units={volumeUnits}
          baseUnit="liter"
        />
      </div>
    </Layout>
  );
});
