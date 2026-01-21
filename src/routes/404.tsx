import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import Layout from '../components/layout';

export default component$(() => {
  return (
    <Layout>
      <div class="container">
        <div class="converter-card" style="text-align: center; padding: 4rem 2rem;">
          <h1 class="converter-title" style="font-size: 4rem; margin-bottom: 1rem;">404</h1>
          <p class="converter-description" style="font-size: 1.25rem; margin-bottom: 2rem;">
            Page not found
          </p>
          <Link href="/" style="display: inline-block; padding: 0.75rem 2rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Go Home
          </Link>
        </div>
      </div>
    </Layout>
  );
});
