/**
 * Analytics - ISR. The fact table changes slowly, so the page is cached and
 * rebuilt in the background every 5 minutes (see `revalidate`). Server actions
 * that mutate tasks call revalidatePath('/analytics') to bust it early.
 */
import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import TaskPivot from '@/components/analytics/TaskPivot';
import { getTaskFacts } from '@/lib/api';

export const revalidate = 300;

export default async function AnalyticsPage() {
  try {
    const facts = await getTaskFacts();
    return (
      <>
        <PageHead
          title="Analytics"
          description="DevExtreme PivotGrid over a flat fact table. Drag fields between the row, column and data areas to re-shape the report in the browser."
          badge="ISR - revalidate 300s"
        />
        <div className="card">
          <TaskPivot facts={facts} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHead title="Analytics" badge="ISR - revalidate 300s" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
