import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return (
    <>
      <nav>
        <h1>Unit Converter Hub</h1>
      </nav>
      <main>
        <Slot />
      </main>
    </>
  );
});
