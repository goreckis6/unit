import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function renderBlogPost(slug: string): Promise<string> {
  const filePath = join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
  const fileContent = await readFile(filePath, 'utf-8');
  const { content } = matter(fileContent);

  const processedContent = await remark().use(remarkHtml).process(content);
  return processedContent.toString();
}
