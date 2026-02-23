import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Manage pages with multi-language support.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Link href="/twojastara/pages" className="admin-card">
          <h2>Pages</h2>
          <p>
            Create and manage pages with translations for all 24 languages
          </p>
          <span className="category-link" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            View all →
          </span>
        </Link>

        <Link href="/twojastara/pages/new" className="admin-card">
          <h2>Add New Page</h2>
          <p>
            Create a new page with language support
          </p>
          <span className="category-link" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Create →
          </span>
        </Link>
      </div>
    </div>
  );
}
