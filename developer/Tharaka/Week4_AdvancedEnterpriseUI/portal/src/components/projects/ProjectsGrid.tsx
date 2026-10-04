'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid, GridColumn, GridToolbar, GridPageChangeEvent, GridSortChangeEvent, GridCellProps
} from '@progress/kendo-react-grid';
import type { SortDescriptor } from '@progress/kendo-data-query';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Loader } from '@progress/kendo-react-indicators';
import type { ProjectRow } from '@/lib/types';
import { deleteProject } from '@/app/actions/projects';
import ProjectForm from './ProjectForm';

const PAGE_SIZE = 10;

export default function ProjectsGrid({
  initialRows,
  initialTotal
}: {
  initialRows: ProjectRow[];
  initialTotal: number;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortDescriptor[]>([{ field: 'name', dir: 'asc' }]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | 'new' | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        take: String(take),
        sortBy: sort[0]?.field ?? 'name',
        sortDir: sort[0]?.dir ?? 'asc'
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/proxy/projects?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load projects');

      const page = await res.json();
      setRows(page.items);
      setTotal(page.total);
    } catch (e) {
      setNotice({ ok: false, text: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [skip, take, sort, search]);

  // Debounced reload whenever paging / sorting / search changes.
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const onPageChange = (e: GridPageChangeEvent) => {
    setSkip(e.page.skip);
    setTake(e.page.take);
  };

  const onSortChange = (e: GridSortChangeEvent) => {
    setSort(e.sort.length ? e.sort : [{ field: 'name', dir: 'asc' }]);
    setSkip(0);
  };

  const onDelete = (project: ProjectRow) => {
    if (!window.confirm(`Delete ${project.code}? Its tasks stay, but become unassigned.`)) return;
    startTransition(async () => {
      const result = await deleteProject(project.id);
      setNotice({ ok: result.ok, text: result.message ?? 'Failed' });
      await load();
      router.refresh();
    });
  };

  const StatusCell = (props: GridCellProps) => {
    const row = props.dataItem as ProjectRow;
    return (
      <td>
        <span className={`pill ${row.isActive ? 'pill-ok' : 'pill-open'}`}>
          {row.isActive ? 'Active' : 'Archived'}
        </span>
      </td>
    );
  };

  const ActionCell = (props: GridCellProps) => {
    const row = props.dataItem as ProjectRow;
    return (
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="small" fillMode="flat" onClick={() => setEditing(row)}>Edit</Button>
          <Button size="small" fillMode="flat" themeColor="error" onClick={() => onDelete(row)} disabled={pending}>
            Delete
          </Button>
        </div>
      </td>
    );
  };

  return (
    <>
      {notice && <div className={`alert ${notice.ok ? 'alert-ok' : 'alert-error'}`}>{notice.text}</div>}

      <Grid
        data={rows}
        total={total}
        skip={skip}
        take={take}
        pageable={{ buttonCount: 5, pageSizes: [10, 20, 50], info: true }}
        onPageChange={onPageChange}
        sortable={{ allowUnsort: false, mode: 'single' }}
        sort={sort}
        onSortChange={onSortChange}
        style={{ minHeight: 420 }}
      >
        <GridToolbar>
          <Input
            placeholder="Search name, code or owner"
            value={search}
            onChange={e => {
              setSearch(String(e.value ?? ''));
              setSkip(0);
            }}
            style={{ width: 260 }}
          />
          <span className="toolbar-spacer" />
          {loading && <Loader size="small" type="pulsing" />}
          <Button themeColor="primary" onClick={() => setEditing('new')}>Add project</Button>
          <Button onClick={load}>Refresh</Button>
        </GridToolbar>

        <GridColumn field="code" title="Code" width="120px" />
        <GridColumn field="name" title="Name" />
        <GridColumn field="owner" title="Owner" width="150px" />
        <GridColumn field="startDate" title="Started" format="{0:dd MMM yyyy}" width="140px" />
        <GridColumn field="taskCount" title="Tasks" width="90px" />
        <GridColumn field="openTaskCount" title="Open" width="90px" />
        <GridColumn title="Status" width="120px" cells={{ data: StatusCell }} sortable={false} />
        <GridColumn title=" " width="150px" cells={{ data: ActionCell }} sortable={false} />
      </Grid>

      {editing && (
        <Dialog
          title={editing === 'new' ? 'Add project' : `Edit ${(editing as ProjectRow).code}`}
          onClose={() => setEditing(null)}
          width={520}
        >
          <ProjectForm
            project={editing === 'new' ? undefined : (editing as ProjectRow)}
            onDone={async message => {
              setEditing(null);
              setNotice({ ok: true, text: message });
              await load();
              router.refresh();
            }}
            onCancel={() => setEditing(null)}
          />
        </Dialog>
      )}
    </>
  );
}
