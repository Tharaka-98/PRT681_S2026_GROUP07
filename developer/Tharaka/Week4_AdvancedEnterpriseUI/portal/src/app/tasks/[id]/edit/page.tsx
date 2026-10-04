import { notFound } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import TaskForm from '@/components/tasks/TaskForm';
import { getProjectLookup, getTask } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) notFound();

  try {
    const [task, projects] = await Promise.all([getTask(taskId), getProjectLookup()]);
    return (
      <>
        <PageHead
          title={`Edit: ${task.title}`}
          description="The same form component in edit mode - initial values come from the server, so there is no empty-form flash."
          badge="Server action"
        >
          <span className={`pill pill-${task.priorityName}`}>{task.priorityName}</span>
        </PageHead>
        <div className="card">
          <TaskForm projects={projects} task={task} />
        </div>
      </>
    );
  } catch (error) {
    if ((error as Error).message.includes('404')) notFound();
    return (
      <>
        <PageHead title="Edit task" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
