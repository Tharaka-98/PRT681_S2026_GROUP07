'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Scheduler, MonthView, WeekView, AgendaView, SchedulerItem, SchedulerItemProps } from '@progress/kendo-react-scheduler';
import type { SchedulerEvent } from '@/lib/types';
import { priorityColor } from '@/lib/viz';

const PRIORITY_BY_ID = ['Low', 'Medium', 'High', 'Critical'];

export default function TaskScheduler({ events }: { events: SchedulerEvent[] }) {
  const router = useRouter();

  const data = useMemo(
    () =>
      events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start: new Date(e.start),
        end: new Date(e.end),
        isAllDay: e.isAllDay,
        priorityId: e.priorityId,
        projectName: e.projectName
      })),
    [events]
  );

  /** Colour each appointment by the task's priority, same ramp as the charts. */
  const item = (props: SchedulerItemProps) => {
    const priority = PRIORITY_BY_ID[(props.dataItem.priorityId as number) ?? 1] ?? 'Medium';
    return (
      <SchedulerItem
        {...props}
        style={{ ...props.style, backgroundColor: priorityColor(priority), borderColor: 'transparent' }}
        onDoubleClick={() => router.push(`/tasks/${props.dataItem.id}/edit`)}
      />
    );
  };

  return (
    <>
      <div className="toolbar">
        {PRIORITY_BY_ID.map(p => (
          <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span
              style={{
                width: 12, height: 12, borderRadius: 3,
                background: priorityColor(p), display: 'inline-block'
              }}
            />
            {p}
          </span>
        ))}
        <span className="toolbar-spacer" />
        <span className="muted" style={{ fontSize: 12 }}>{data.length} scheduled tasks</span>
      </div>

      <Scheduler data={data} defaultDate={new Date()} item={item} editable={false} height={620}>
        <MonthView />
        <WeekView />
        <AgendaView />
      </Scheduler>

      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        Double-click an appointment to open that task in the edit form.
      </p>
    </>
  );
}
