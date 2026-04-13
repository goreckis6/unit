import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/hreflang';
import { getSitemapChunkCount } from '@/lib/sitemap-entries';

export const revalidate = 3600;

export async function GET() {
  const currentDate = new Date().toISOString();
  const chunkCount = await getSitemapChunkCount();

  const indexEntries = Array.from({ length: chunkCount }, (_, i) => {
    const n = i + 1;
    const loc = `${BASE_URL}/sitemap${n}.xml`;
    return `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
