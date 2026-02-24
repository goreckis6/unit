import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div>
      <h1>Unit Converter Hub</h1>
      <p>Welcome to Unit Converter Hub - Qwik version</p>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Unit Converter Hub - Free Online Calculators',
  meta: [
    {
      name: 'description',
      content: 'Free online calculators and unit converters',
    },
  ],
};

