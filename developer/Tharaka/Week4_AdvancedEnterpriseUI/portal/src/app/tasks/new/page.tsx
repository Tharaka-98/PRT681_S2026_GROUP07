import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import TaskForm from '@/components/tasks/TaskForm';
import { getProjectLookup } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function NewTaskPage() {
  try {
    const projects = await getProjectLookup();
    return (
      <>
        <PageHead
          title="New task"
          description="KendoReact Form. Fields validate on blur against a zod schema that the server action re-checks before it calls the API."
          badge="Server action"
        />
        <div className="card">
          <TaskForm projects={projects} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHead title="New task" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
