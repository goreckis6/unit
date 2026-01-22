import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { renderBlogPost } from '@/lib/mdx-renderer';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link href="/blog">{t('backToBlog')}</Link>
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  );
}
