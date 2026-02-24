import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  
  return (
    <div class="app">
      <nav class="navbar">
        <div class="container">
          <Link href="/" class="logo">Unit Converter Hub</Link>
          <div class="nav-links">
            <Link href="/calculators/math-calculators">Calculators</Link>
            <Link href="/">Home</Link>
          </div>
        </div>
      </nav>
      <Slot />
    </div>
  );
});

