'use client';

/**
 * PivotGrid - the component class you cannot sensibly hand-roll, which is the
 * whole argument for a commercial suite. Fields are declared once; the user
 * does the rest (drag, expand, drill, export).
 */
import { useMemo, useState } from 'react';
import PivotGrid, { FieldChooser, FieldPanel, Export, Scrolling } from 'devextreme-react/pivot-grid';
import PivotGridDataSource from 'devextreme/ui/pivot_grid/data_source';
import { Button } from '@progress/kendo-react-buttons';
import type { TaskFact } from '@/lib/types';

export default function TaskPivot({ facts }: { facts: TaskFact[] }) {
  const [showChooser, setShowChooser] = useState(false);

  const dataSource = useMemo(
    () =>
      new PivotGridDataSource({
        store: facts,
        fields: [
          { caption: 'Project', dataField: 'projectName', area: 'row', expanded: true, width: 200 },
          { caption: 'Assignee', dataField: 'assignedTo', area: 'row' },
          { caption: 'Status', dataField: 'status', area: 'column' },
          { caption: 'Priority', dataField: 'priorityName', area: 'filter' },
          { caption: 'Year', dataField: 'year', area: 'filter', dataType: 'number' },
          { caption: 'Month', dataField: 'monthName', area: 'filter' },
          {
            caption: 'Tasks',
            dataField: 'taskCount',
            dataType: 'number',
            summaryType: 'sum',
            area: 'data'
          },
          {
            caption: 'Est. hours',
            dataField: 'estimatedHours',
            dataType: 'number',
            summaryType: 'sum',
            format: { type: 'fixedPoint', precision: 1 },
            area: 'data'
          }
        ]
      }),
    [facts]
  );

  return (
    <>
      <div className="toolbar">
        <span className="muted">
          {facts.length} fact rows &middot; rows: project / assignee &middot; columns: status
        </span>
        <span className="toolbar-spacer" />
        <Button onClick={() => setShowChooser(s => !s)}>
          {showChooser ? 'Hide field chooser' : 'Show field chooser'}
        </Button>
      </div>

      <PivotGrid
        dataSource={dataSource}
        allowSortingBySummary
        allowSorting
        allowFiltering
        allowExpandAll
        showBorders
        showColumnGrandTotals
        showRowGrandTotals
        height={520}
      >
        <FieldPanel
          visible
          showColumnFields
          showDataFields
          showFilterFields
          showRowFields
          allowFieldDragging
        />
        <FieldChooser enabled height={420} applyChangesMode="instantly" />
        <Scrolling mode="virtual" />
        <Export enabled={false} />
      </PivotGrid>

      {showChooser && (
        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          Right-click any field header, or drag fields between the panels above the grid.
        </p>
      )}
    </>
  );
}
