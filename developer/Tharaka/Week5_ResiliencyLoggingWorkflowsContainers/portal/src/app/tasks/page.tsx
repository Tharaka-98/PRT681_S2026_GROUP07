/**
 * Tasks - SSR shell + a client grid that pages against the API.
 *
 * The first page of rows is fetched here on the server so the grid has data in
 * the initial HTML (good first paint, works with JS still loading). After that
 * the DevExtreme DataGrid takes over and pages/sorts/filters remotely.
 */
import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import TasksGrid from '@/components/tasks/TasksGrid';
import { getAssignees, getProjectLookup, getTasksPage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  try {
    const [firstPage, projects, assignees] = await Promise.all([
      getTasksPage('page=1&pageSize=10&sortBy=createdAt&sortDir=desc'),
      getProjectLookup(),
      getAssignees()
    ]);

    return (
      <>
        <PageHead
          title="Tasks"
          description="DevExtreme DataGrid bound to a remote CustomStore - paging, sorting, filtering and the row count all happen in SQL, not in the browser."
          badge="SSR + remote paging"
        />
        <div className="card">
          <TasksGrid
            initialRows={firstPage.items}
            initialTotal={firstPage.total}
            projects={projects}
            assignees={assignees}
          />
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHead title="Tasks" badge="SSR + remote paging" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
