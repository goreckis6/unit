import { revalidatePath, revalidateTag } from 'next/cache';
import { SITEMAP_CHUNK_REVALIDATE_CAP } from '@/lib/sitemap-entries';

/** Call after CMS publishes so index + all chunk routes refresh (ISR + data cache). */
export function revalidateSitemapAll(): void {
  revalidateTag('sitemap');
  revalidatePath('/sitemap.xml');
  for (let i = 0; i < SITEMAP_CHUNK_REVALIDATE_CAP; i++) {
    revalidatePath(`/sitemap/${i}`);
  }
}
