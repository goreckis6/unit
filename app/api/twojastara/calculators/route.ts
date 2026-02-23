import { NextResponse } from 'next/server';
import { getAllCalculators } from '@/lib/all-calculators';
import { prisma } from '@/lib/prisma';

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    cur = typeof cur === 'object' && cur !== null && p in (cur as object)
      ? (cur as Record<string, unknown>)[p]
      : undefined;
  }
  return typeof cur === 'string' ? cur : '';
}

export async function GET() {
  let messages: Record<string, unknown> = {};
  try {
    messages = (await import('@/i18n/en.json')).default ?? {};
  } catch {}
  const calcMessages = (messages.calculators as Record<string, unknown>) ?? {};

  const staticCalcs = getAllCalculators();
  const staticOptions = staticCalcs.map((c) => {
    const path = c.path.replace(/^\//, '').replace(/^calculators\//, '');
    const title = getNested(calcMessages as Record<string, unknown>, c.titleKey) || c.id;
    const description = getNested(calcMessages as Record<string, unknown>, c.descKey) || '';
    return {
      value: path,
      label: `${path} — ${title}`,
      title,
      description,
    };
  });

  const pages = await prisma.page.findMany({
    where: { published: true },
    include: { translations: true },
  });

  const prismaOptions = pages.map((p) => {
    const t = p.translations.find((x) => x.locale === 'en') ?? p.translations[0];
    return {
      value: `${p.category}/${p.slug}`,
      label: `${p.category}/${p.slug} — ${t?.title ?? p.slug}`,
      title: t?.title ?? p.slug,
      description: t?.description ?? '',
    };
  });

  const byValue = new Map<string, { value: string; label: string; title: string; description: string }>();
  for (const o of staticOptions) {
    byValue.set(o.value, o);
  }
  for (const o of prismaOptions) {
    byValue.set(o.value, o);
  }

  return NextResponse.json(Array.from(byValue.values()));
}
