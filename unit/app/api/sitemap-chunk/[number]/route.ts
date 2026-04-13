import { NextResponse } from 'next/server';
import { getSitemapChunkCount, getSitemapChunkFullXml } from '@/lib/sitemap-entries';

export const revalidate = 3600;

type Props = { params: Promise<{ number: string }> };

/** Served via rewrite: /sitemap1.xml → /api/sitemap-chunk/1 (1-based chunk index) */
export async function GET(_request: Request, { params }: Props) {
  const { number: numberRaw } = await params;
  if (!/^\d+$/.test(numberRaw)) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const page = parseInt(numberRaw, 10);
  if (page < 1) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const index = page - 1;
  const chunkCount = await getSitemapChunkCount();
  if (index >= chunkCount) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const xml = await getSitemapChunkFullXml(index);
  if (!xml.trim()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
