'use client';

/**
 * DevExtreme DataGrid with server-side paging.
 *
 * CustomStore.load() receives DevExtreme's skip/take/sort/filter state, turns it
 * into our API's query string and returns { data, totalCount } - that shape is
 * what tells the grid how many pages exist without downloading every row.
 */
import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import DataGrid, {
  Column, Paging, Pager, Sorting, HeaderFilter, SearchPanel, Selection,
  Toolbar, Item, StateStoring, Scrolling, Summary, TotalItem, LoadPanel
} from 'devextreme-react/data-grid';
import type { DataGridRef } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import type { Lookup, TaskRow } from '@/lib/types';
import { bulkTaskAction, toggleTask } from '@/app/actions/tasks';

type StatusFilter = 'all' | 'open' | 'completed' | 'overdue';

const STATUS_OPTIONS: { text: string; value: StatusFilter }[] = [
  { text: 'All tasks', value: 'all' },
  { text: 'Open only', value: 'open' },
  { text: 'Completed only', value: 'completed' },
  { text: 'Overdue only', value: 'overdue' }
];

interface LoadOptions {
  skip?: number;
  take?: number;
  sort?: unknown;
  searchValue?: string;
}

export default function TasksGrid({
  initialRows,
  initialTotal,
  projects,
  assignees
}: {
  initialRows: TaskRow[];
  initialTotal: number;
  projects: Lookup[];
  assignees: string[];
}) {
  const router = useRouter();
  const gridRef = useRef<DataGridRef>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [assignee, setAssignee] = useState<string>('');
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // The store is rebuilt whenever a toolbar filter changes, which makes the
  // grid re-request page 1 with the new query - no manual refresh needed.
  const store = useMemo(() => {
    let firstLoad = true;

    return new CustomStore({
      key: 'id',
      loadMode: 'processed',

      load: async (options: LoadOptions) => {
        const skip = options.skip ?? 0;
        const take = options.take ?? 10;

        // Serve the server-rendered rows on the very first load so the grid
        // does not immediately re-fetch what the page already delivered.
        if (firstLoad && skip === 0 && status === 'all' && !projectId && !assignee) {
          firstLoad = false;
          return { data: initialRows, totalCount: initialTotal };
        }
        firstLoad = false;

        const sort = Array.isArray(options.sort) ? options.sort[0] as { selector: string; desc: boolean } : null;
        const params = new URLSearchParams({
          skip: String(skip),
          take: String(take),
          sortBy: sort?.selector ?? 'createdAt',
          sortDir: sort?.desc === false ? 'asc' : 'desc',
          status
        });

        if (options.searchValue) params.set('search', String(options.searchValue));
        if (projectId) params.set('projectId', String(projectId));
        if (assignee) params.set('assignedTo', assignee);

        const res = await fetch(`/api/proxy/tasks?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load tasks');

        const page = await res.json();
        return { data: page.items as TaskRow[], totalCount: page.total as number };
      }
    });
  }, [status, projectId, assignee, initialRows, initialTotal]);

  const refresh = () => {
    gridRef.current?.instance().refresh();
    router.refresh();              // re-runs the server component (KPI tiles etc.)
  };

  const runBulk = (action: 'complete' | 'reopen' | 'delete') => {
    if (selected.length === 0) {
      setNotice({ ok: false, text: 'Select at least one row first' });
      return;
    }
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} task(s)?`)) return;

    startTransition(async () => {
      const result = await bulkTaskAction(action, selected);
      setNotice({ ok: result.ok, text: result.message ?? (result.ok ? 'Done' : 'Failed') });
      setSelected([]);
      refresh();
    });
  };

  const onToggle = (id: number) => {
    startTransition(async () => {
      await toggleTask(id);
      refresh();
    });
  };

  return (
    <>
      {notice && (
        <div className={`alert ${notice.ok ? 'alert-ok' : 'alert-error'}`}>{notice.text}</div>
      )}

      <div className="toolbar">
        <DropDownList
          data={STATUS_OPTIONS}
          textField="text"
          dataItemKey="value"
          value={STATUS_OPTIONS.find(o => o.value === status)}
          onChange={e => setStatus(e.value.value)}
          style={{ width: 170 }}
          ariaLabel="Status filter"
        />
        <DropDownList
          data={[{ id: 0, label: 'All projects' }, ...projects]}
          textField="label"
          dataItemKey="id"
          defaultValue={{ id: 0, label: 'All projects' }}
          onChange={e => setProjectId(e.value.id === 0 ? null : e.value.id)}
          style={{ width: 240 }}
          ariaLabel="Project filter"
        />
        <DropDownList
          data={['All assignees', ...assignees]}
          defaultValue="All assignees"
          onChange={e => setAssignee(e.value === 'All assignees' ? '' : e.value)}
          style={{ width: 180 }}
          ariaLabel="Assignee filter"
        />

        <span className="toolbar-spacer" />

        <Button themeColor="primary" onClick={() => router.push('/tasks/new')}>
          New task
        </Button>
        <Button onClick={() => runBulk('complete')} disabled={pending}>Complete</Button>
        <Button onClick={() => runBulk('reopen')} disabled={pending}>Reopen</Button>
        <Button themeColor="error" fillMode="outline" onClick={() => runBulk('delete')} disabled={pending}>
          Delete
        </Button>
      </div>

      <DataGrid
        ref={gridRef}
        dataSource={store}
        remoteOperations={{ paging: true, sorting: true, filtering: true }}
        showBorders
        columnAutoWidth
        rowAlternationEnabled
        hoverStateEnabled
        height={560}
        selectedRowKeys={selected}
        onSelectionChanged={e => setSelected(e.selectedRowKeys as number[])}
        onRowDblClick={e => router.push(`/tasks/${(e.data as TaskRow).id}/edit`)}
      >
        <LoadPanel enabled />
        <Scrolling mode="standard" />
        <Sorting mode="single" />
        <HeaderFilter visible={false} />
        <SearchPanel visible width={260} placeholder="Search title, description, assignee" />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <Paging defaultPageSize={10} />
        <Pager
          visible
          showInfo
          showNavigationButtons
          showPageSizeSelector
          allowedPageSizes={[10, 20, 50]}
          infoText="Page {0} of {1} ({2} tasks)"
        />

        <Column dataField="title" caption="Title" minWidth={220} />
        <Column
          dataField="priorityName"
          caption="Priority"
          width={110}
          cellRender={({ data }: { data: TaskRow }) => (
            <span className={`pill pill-${data.priorityName}`}>{data.priorityName}</span>
          )}
        />
        <Column dataField="projectName" caption="Project" width={190} />
        <Column dataField="assignedTo" caption="Assignee" width={130} />
        <Column dataField="dueDate" caption="Due" dataType="date" format="dd MMM yyyy" width={120} />
        <Column
          dataField="estimatedHours"
          caption="Est. h"
          dataType="number"
          width={90}
          alignment="right"
        />
        <Column
          caption="Status"
          width={120}
          allowSorting={false}
          cellRender={({ data }: { data: TaskRow }) => {
            const cls = data.isCompleted ? 'pill-ok' : data.isOverdue ? 'pill-overdue' : 'pill-open';
            const text = data.isCompleted ? 'Completed' : data.isOverdue ? 'Overdue' : 'Open';
            return <span className={`pill ${cls}`}>{text}</span>;
          }}
        />
        <Column
          caption=""
          width={150}
          allowSorting={false}
          cellRender={({ data }: { data: TaskRow }) => (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button size="small" fillMode="flat" onClick={() => onToggle(data.id)}>
                {data.isCompleted ? 'Reopen' : 'Done'}
              </Button>
              <Button size="small" fillMode="flat" onClick={() => router.push(`/tasks/${data.id}/edit`)}>
                Edit
              </Button>
            </div>
          )}
        />

        <Summary>
          <TotalItem column="estimatedHours" summaryType="sum" valueFormat="#0.0" displayFormat="{0} h (page)" />
        </Summary>

        <Toolbar>
          <Item name="searchPanel" location="before" />
          <Item name="columnChooserButton" />
          <Item
            location="after"
            widget="dxButton"
            options={{ icon: 'refresh', hint: 'Reload', onClick: refresh }}
          />
        </Toolbar>

        <StateStoring enabled type="localStorage" storageKey="week4-tasks-grid" />
      </DataGrid>

      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        Double-click a row to edit it. Column widths, sort order and page size are
        remembered per browser via <code className="mono">StateStoring</code>.
      </p>
    </>
  );
}
