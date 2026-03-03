'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import type { StatsExtended } from '@/lib/admin-stats';

type StatsChartsProps = {
  stats: StatsExtended;
};

export function StatsCharts({ stats }: StatsChartsProps) {
  const {
    funnelData,
    donutData,
    categoryBarData,
    localeCoverage,
    activityByWeek,
    translationProgress,
    total,
    withCalculator,
  } = stats;

  const chartTextColor = 'var(--text-primary)';
  const gridColor = 'var(--border-light)';

  return (
    <div className="stats-charts">
      {/* Summary metrics */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-stat-card dashboard-stat-primary">
          <span className="dashboard-stat-value">{total}</span>
          <span className="dashboard-stat-label">Total Pages</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-success">
          <span className="dashboard-stat-value">{stats.published}</span>
          <span className="dashboard-stat-label">Published</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-info">
          <span className="dashboard-stat-value">{translationProgress.filled}</span>
          <span className="dashboard-stat-label">Translation Slots</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-muted">
          <span className="dashboard-stat-value">
            {total > 0 ? Math.round(translationProgress.avgPerPage) : 0}
          </span>
          <span className="dashboard-stat-label">Avg Locales/Page</span>
        </div>
        <div className="dashboard-stat-card dashboard-stat-warning">
          <span className="dashboard-stat-value">{withCalculator}</span>
          <span className="dashboard-stat-label">With Calculator</span>
        </div>
      </div>

      <div className="stats-charts-grid">
        {/* Pipeline funnel bar */}
        <section className="stats-chart-section">
          <h2 className="dashboard-section-title">Pipeline Funnel</h2>
          <div className="stats-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={chartTextColor} fontSize={12} />
                <YAxis type="category" dataKey="name" width={90} stroke={chartTextColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: chartTextColor }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Stage donut */}
        <section className="stats-chart-section">
          <h2 className="dashboard-section-title">By Stage</h2>
          <div className="stats-chart-wrap stats-chart-donut">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={donutData[i].fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Category bar */}
        <section className="stats-chart-section stats-chart-full">
          <h2 className="dashboard-section-title">Pages by Category</h2>
          <div className="stats-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(250, categoryBarData.length * 28)}>
              <BarChart data={categoryBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={chartTextColor} fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} stroke={chartTextColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--primary-color)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Locale coverage */}
        <section className="stats-chart-section stats-chart-full">
          <h2 className="dashboard-section-title">Locale Coverage (% of pages)</h2>
          <div className="stats-chart-wrap">
            <ResponsiveContainer width="100%" height={Math.max(280, localeCoverage.length * 22)}>
              <BarChart data={localeCoverage} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="locale" stroke={chartTextColor} fontSize={11} tick={{ fontSize: 10 }} />
                <YAxis stroke={chartTextColor} fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, _name: string, item: { payload?: { locale: string; count: number } }) => {
                    const p = item?.payload;
                    return p ? [`${p.count} pages (${value}%)`, p.locale] : [value, ''];
                  }}
                />
                <Bar dataKey="pct" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Activity over time */}
        <section className="stats-chart-section stats-chart-full">
          <h2 className="dashboard-section-title">Activity (last 12 weeks)</h2>
          <div className="stats-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={activityByWeek} margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="week" stroke={chartTextColor} fontSize={11} />
                <YAxis stroke={chartTextColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [value, name === 'created' ? 'Created' : 'Updated']}
                />
                <Legend formatter={(value) => (value === 'created' ? 'Created' : 'Updated')} />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="updated" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
