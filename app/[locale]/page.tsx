import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header>
        <h1>{t('siteName')}</h1>
        <p>{t('description')}</p>
      </header>
      <nav>
        <Link href="/calculators/addition">{t('calculators')}</Link>
        <Link href="/blog">{t('blog')}</Link>
      </nav>
    </div>
  );
}
