import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { renderBlogPost } from '@/lib/mdx-renderer';
import { generateHreflangUrls, BASE_URL } from '@/lib/hreflang';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Not Found' };
  const t = await getTranslations({ locale, namespace: 'common' });
  const path = `/blog/${slug}`;
  const canonicalUrl = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  const title = `${post.title} | ${t('siteName')}`;
  return {
    title,
    description: post.excerpt,
    alternates: { canonical: canonicalUrl, languages: generateHreflangUrls(path) },
    openGraph: { title, description: post.excerpt, type: 'article', url: canonicalUrl },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const content = await renderBlogPost(slug);
  const t = await getTranslations('blog');

  return (
    <>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <Link href="/blog">{t('backToBlog')}</Link>
        <article>
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </div>
      <Footer />
    </>
  );
}
