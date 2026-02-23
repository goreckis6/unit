import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { TranslateProvider } from '../TranslateContext';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/twojastara/login');
  }

  return (
    <TranslateProvider>
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link href="/twojastara" className="admin-brand">
            Admin Panel
          </Link>
          <nav className="admin-nav">
            <Link href="/twojastara">Dashboard</Link>
            <Link href="/twojastara/pages">Pages</Link>
            <Link href="/twojastara/pages/new">New Page</Link>
          </nav>
          <div className="admin-header-actions">
            <span className="admin-user">{session.email}</span>
            <form action="/api/twojastara/logout" method="POST">
              <button type="submit" className="btn btn-secondary btn-sm">
                Logout
              </button>
            </form>
            <Link href="/" className="admin-back">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>
      <main className="admin-main">
        {children}
      </main>
    </div>
    </TranslateProvider>
  );
}
