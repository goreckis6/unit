import { prisma } from '@/lib/prisma';
import { BASE_URL } from '@/lib/hreflang';
import { ROUTING_LOCALES } from '@/i18n/locales';
import { hashForDisplayName } from '@/lib/txt-file-hash';

/** Admin TXT file name whose content is the IndexNow key (Bing/Web). */
export const INDEXNOW_KEY_TXT_DISPLAY_NAME = 'klucz.txt';

const MAX_URLS_PER_REQUEST = 10_000;

function isIndexNowEnabled(): boolean {
  return process.env.INDEXNOW_ENABLED !== 'false';
}

/** Absolute URLs for all locale variants of a published calculator page (same pattern as sitemap). */
export function urlsForCalculatorPage(category: string, slug: string): string[] {
  const route = `/calculators/${category.trim()}/${slug}`;
  return ROUTING_LOCALES.map((locale) =>
    locale === 'en' ? `${BASE_URL}${route}` : `${BASE_URL}/${locale}${route}`
  );
}

/**
 * Notifies IndexNow (Bing, Yandex, etc.) that URLs were added or updated.
 * Key and key file URL come from admin TXT `klucz.txt` (content = key; public URL = /klucz.txt).
 */
export async function submitIndexNowForUrls(urls: string[]): Promise<void> {
  if (!isIndexNowEnabled() || urls.length === 0) return;

  const hash = hashForDisplayName(INDEXNOW_KEY_TXT_DISPLAY_NAME);
  const row = await prisma.txtFile.findUnique({
    where: { hash },
    select: { content: true },
  });
  const key = row?.content?.trim() ?? '';
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[IndexNow] Skipped: empty or missing TXT file', INDEXNOW_KEY_TXT_DISPLAY_NAME);
    }
    return;
  }

  const host = new URL(BASE_URL).hostname;
  const keyLocation = `${BASE_URL}/${INDEXNOW_KEY_TXT_DISPLAY_NAME}`;
  const unique = [...new Set(urls)];

  for (let i = 0; i < unique.length; i += MAX_URLS_PER_REQUEST) {
    const urlList = unique.slice(i, i + MAX_URLS_PER_REQUEST);
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[IndexNow] Request failed:', res.status, text);
    }
  }
}
