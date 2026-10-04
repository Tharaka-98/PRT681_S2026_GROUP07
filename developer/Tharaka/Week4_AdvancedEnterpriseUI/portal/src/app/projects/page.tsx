/**
 * Projects - KendoReact Grid with server-side paging and sorting.
 *
 * Deliberately the other suite from the Tasks page, so the submission shows
 * both commercial component libraries doing the same class of job.
 */
import PageHead from '@/components/ui/PageHead';
import ApiErrorNotice from '@/components/ui/ApiErrorNotice';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import { getProjectsPage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  try {
    const firstPage = await getProjectsPage('page=1&pageSize=10&sortBy=name&sortDir=asc');
    return (
      <>
        <PageHead
          title="Projects"
          description="KendoReact Grid. Paging and sorting state is lifted into React and sent to the API; the grid only ever holds one page of rows."
          badge="SSR + remote paging"
        />
        <div className="card">
          <ProjectsGrid initialRows={firstPage.items} initialTotal={firstPage.total} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <>
        <PageHead title="Projects" badge="SSR + remote paging" />
        <ApiErrorNotice error={error} />
      </>
    );
  }
}
