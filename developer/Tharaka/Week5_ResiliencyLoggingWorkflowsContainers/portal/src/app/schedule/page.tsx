/**
 * Schedule - KendoReact Scheduler over task due dates.
 */
import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import TaskScheduler from '@/components/schedule/TaskScheduler';
import { getSchedule } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  try {
    const events = await getSchedule();
    return (
      <>
        <PageHead
          title="Schedule"
          description="Every task with a due date, laid out in the KendoReact Scheduler. Read-only here - the edit form owns the write path."
          badge="SSR - dynamic"
        />
        <div className="card">
          <TaskScheduler events={events} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHead title="Schedule" badge="SSR - dynamic" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
