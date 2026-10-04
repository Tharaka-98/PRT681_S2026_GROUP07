/**
 * Dashboard - Server-Side Rendered on every request.
 *
 * `force-dynamic` opts the route out of all caching: the KPI tiles must show
 * the numbers as they are right now. The charts below are client components,
 * but they receive their data as props, already fetched here on the server.
 */
import PageHead from '@/components/ui/PageHead';
import StatTile from '@/components/ui/StatTile';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import SummaryCharts from '@/components/analytics/SummaryCharts';
import { getHealth, getSummary } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let summary;
  let health: { status: string; database: string } | null = null;

  try {
    [summary, health] = await Promise.all([
      getSummary(),
      getHealth().catch(() => null)
    ]);
  } catch (error) {
    return (
      <>
        <PageHead title="Dashboard" badge="SSR - dynamic" />
        <ApiErrorNotice error={error} />
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Dashboard"
        description="Portfolio health across every project. Rendered on the server on each request, so the figures are never stale."
        badge="SSR - dynamic"
      >
        {health && (
          <span className={`pill ${health.status === 'healthy' ? 'pill-ok' : 'pill-overdue'}`}>
            API {health.status}
          </span>
        )}
      </PageHead>

      <div className="tile-row">
        <StatTile label="Total tasks" value={summary.totalTasks} hint="all projects" />
        <StatTile label="Open" value={summary.openTasks} hint="not yet completed" />
        <StatTile
          label="Overdue"
          value={summary.overdueTasks}
          hint="past due date"
          tone={summary.overdueTasks > 0 ? 'danger' : 'ok'}
        />
        <StatTile
          label="Completion rate"
          value={`${summary.completionRate}%`}
          hint={`${summary.completedTasks} of ${summary.totalTasks} done`}
          tone="ok"
        />
        <StatTile label="Active projects" value={summary.activeProjects} />
        <StatTile
          label="Estimated effort"
          value={`${summary.totalEstimatedHours} h`}
          hint="sum of all estimates"
        />
      </div>

      <SummaryCharts byPriority={summary.tasksByPriority} byProject={summary.tasksByProject} />
    </>
  );
}
