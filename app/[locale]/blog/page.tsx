import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getBlogPosts } from '@/lib/blog';

export default async function BlogPage() {
  const t = await getTranslations('common');
  const posts = await getBlogPosts();

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1>{t('blog')}</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
}
