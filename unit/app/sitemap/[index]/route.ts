import { NextResponse } from 'next/server';
import { getSitemapUrlXmlFragments, SITEMAP_URLS_PER_CHUNK } from '@/lib/sitemap-entries';

export const revalidate = 3600;

type Props = { params: Promise<{ index: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { index: indexRaw } = await params;
  if (!/^\d+$/.test(indexRaw)) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const index = parseInt(indexRaw, 10);
  if (index < 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const fragments = await getSitemapUrlXmlFragments();
  const chunkCount = Math.max(1, Math.ceil(fragments.length / SITEMAP_URLS_PER_CHUNK));
  if (index >= chunkCount) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const start = index * SITEMAP_URLS_PER_CHUNK;
  const slice = fragments.slice(start, start + SITEMAP_URLS_PER_CHUNK);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${slice.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
