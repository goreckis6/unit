import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const contentDir = join(process.cwd(), 'content', 'blog');
  const files = await readdir(contentDir);
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const slug = file.replace('.mdx', '');
      const filePath = join(contentDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { data } = matter(content);

      return {
        slug,
        title: data.title || slug,
        excerpt: data.excerpt || '',
        date: data.date || '',
      };
    })
  );

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
    const content = await readFile(filePath, 'utf-8');
    const { data } = matter(content);

    return {
      slug,
      title: data.title || slug,
      excerpt: data.excerpt || '',
      date: data.date || '',
    };
  } catch {
    return null;
  }
}
