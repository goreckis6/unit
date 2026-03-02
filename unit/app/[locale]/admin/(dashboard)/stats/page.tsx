import Link from 'next/link';
import { getStatsExtended } from '@/lib/admin-stats';
import { StatsCharts } from '@/components/admin/StatsCharts';

export default async function AdminStatsPage() {
  const stats = await getStatsExtended();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Statistics
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Charts and metrics for pages and translations
          </p>
        </div>
        <Link href="/twojastara" className="btn btn-secondary btn-sm">
          ← Dashboard
        </Link>
      </div>

      <StatsCharts stats={stats} />
    </div>
  );
}
