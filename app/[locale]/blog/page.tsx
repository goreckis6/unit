import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getBlogPosts } from '@/lib/blog';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const path = '/blog';
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  const title = `${t('blog')} | ${t('siteName')}`;
  return {
    title,
    description: t('blogDescription'),
    alternates: { canonical: canonicalUrl, languages: generateHreflangUrls(path) },
    openGraph: { title, description: t('blogDescription'), type: 'website', url: canonicalUrl },
  };
}

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
