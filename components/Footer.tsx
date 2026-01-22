import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('common');

  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} {t('siteName')}. All rights reserved.</p>
      </div>
    </footer>
  );
}
