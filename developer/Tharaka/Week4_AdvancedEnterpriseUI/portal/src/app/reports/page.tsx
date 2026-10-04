/**
 * Reports - Static Site Generation with ISR.
 *
 * `dynamic = 'force-static'` plus `revalidate` makes Next.js render this page at
 * build time, serve it from the edge cache, and rebuild it in the background
 * once an hour. Open the terminal during `npm run build` and this route is
 * marked with a filled circle; /tasks and /projects are marked dynamic.
 */
import PageHead from '@/components/ui/PageHead';
import StatTile from '@/components/ui/StatTile';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import { apiGet } from '@/lib/api';
import type { DashboardSummary, Paged, ProjectRow } from '@/lib/types';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function ReportsPage() {
  let summary: DashboardSummary;
  let projects: Paged<ProjectRow>;

  try {
    [summary, projects] = await Promise.all([
      apiGet<DashboardSummary>('/api/analytics/summary', 3600),
      apiGet<Paged<ProjectRow>>('/api/projects?pageSize=50&sortBy=name&sortDir=asc', 3600)
    ]);
  } catch (error) {
    return (
      <>
        <PageHead title="Portfolio report" badge="SSG - revalidate 3600s" />
        <ApiErrorNotice error={error} />
      </>
    );
  }

  const generated = new Date().toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <PageHead
        title="Portfolio report"
        description="Pre-rendered at build time and refreshed hourly. Cheap to serve, and the page still works if the API is briefly down."
        badge="SSG - revalidate 3600s"
      />

      <div className="tile-row">
        <StatTile label="Projects" value={projects.total} />
        <StatTile label="Tasks" value={summary.totalTasks} />
        <StatTile label="Completed" value={summary.completedTasks} tone="ok" />
        <StatTile label="Overdue" value={summary.overdueTasks} tone={summary.overdueTasks ? 'danger' : 'ok'} />
      </div>

      <section className="card">
        <h2 className="card-title">Project breakdown</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>Code</th>
              <th style={th}>Project</th>
              <th style={th}>Owner</th>
              <th style={{ ...th, textAlign: 'right' }}>Tasks</th>
              <th style={{ ...th, textAlign: 'right' }}>Open</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.items.map(p => (
              <tr key={p.id}>
                <td style={{ ...td, fontFamily: 'Menlo, monospace', fontSize: 12 }}>{p.code}</td>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.owner}</td>
                <td style={num}>{p.taskCount}</td>
                <td style={num}>{p.openTaskCount}</td>
                <td style={td}>
                  <span className={`pill ${p.isActive ? 'pill-ok' : 'pill-open'}`}>
                    {p.isActive ? 'Active' : 'Archived'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
          Snapshot generated {generated}. Reload after the revalidation window to see it move.
        </p>
      </section>
    </>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '1px solid var(--border)',
  fontWeight: 600,
  color: 'var(--text-muted)',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const td: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #eef1f4' };
const num: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
