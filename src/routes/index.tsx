import { component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestEvent } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import Layout from '../components/layout';
import { useTranslate } from '../i18n/useTranslate';
import { getLocaleFromUrl } from '../i18n/i18n';

export const useLocale = routeLoader$(({ url }: RequestEvent) => {
  return getLocaleFromUrl(url);
});

export const head: DocumentHead = ({ resolveValue, url }) => {
  const locale = resolveValue(useLocale);
  const t = useTranslate(locale);
  const baseUrl = url.origin;
  
  return {
    title: t('og.title'),
    htmlAttributes: {
      lang: locale,
    },
    meta: [
      {
        name: 'description',
        content: t('og.description'),
      },
      {
        name: 'keywords',
        content: t('keywords'),
      },
      // Open Graph
      {
        property: 'og:title',
        content: t('og.title'),
      },
      {
        property: 'og:description',
        content: t('og.description'),
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: baseUrl + url.pathname,
      },
      {
        property: 'og:site_name',
        content: t('og.siteName'),
      },
      {
        property: 'og:locale',
        content: locale === 'pl' ? 'pl_PL' : 'en_US',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: t('og.title'),
      },
      {
        name: 'twitter:description',
        content: t('og.description'),
      },
    ],
    links: [
      {
        rel: 'alternate',
        hreflang: 'en',
        href: baseUrl + '/',
      },
      {
        rel: 'alternate',
        hreflang: 'pl',
        href: baseUrl + '/pl',
      },
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: baseUrl + '/',
      },
    ],
  };
};

export default component$(() => {
  const locale = useLocale();
  const t = useTranslate(locale.value);

  const converters = [
    {
      href: '/length',
      key: 'length' as const,
    },
    {
      href: '/weight',
      key: 'weight' as const,
    },
    {
      href: '/temperature',
      key: 'temperature' as const,
    },
    {
      href: '/volume',
      key: 'volume' as const,
    },
  ];

  return (
    <Layout locale={locale.value}>
      <div class="container">
        <div class="hero">
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </div>
        
        <div class="converter-grid">
          {converters.map((converter) => (
            <a key={converter.href} href={converter.href} class="converter-link">
              <h3>{t(`converters.${converter.key}.title`)}</h3>
              <p>{t(`converters.${converter.key}.description`)}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
});
