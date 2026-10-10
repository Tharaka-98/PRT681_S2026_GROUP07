'use client';

/**
 * KendoReact Form with client-side validation driven by the shared zod schema.
 *
 * Two layers of checking, on purpose:
 *   1. per-field validators    -> instant feedback as the user types/blurs
 *   2. the server action       -> re-validates the same schema before the API call
 * The ASP.NET Core DTO attributes are the third and final gate.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormElement, Field, FormRenderProps } from '@progress/kendo-react-form';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import {
  FormInput, FormTextArea, FormNumeric, FormDatePicker, FormDropDown, FormCheckbox
} from '@/components/form/FormComponents';
import { PRIORITIES, type Lookup, type TaskRow } from '@/lib/types';
import { fieldValidator, taskSchema } from '@/lib/validation';
import { createTask, deleteTask, updateTask } from '@/app/actions/tasks';

const v = {
  title: fieldValidator(taskSchema, 'title'),
  description: fieldValidator(taskSchema, 'description'),
  assignedTo: fieldValidator(taskSchema, 'assignedTo'),
  estimatedHours: fieldValidator(taskSchema, 'estimatedHours')
};

const requiredProject = (value: unknown) =>
  value === null || value === undefined ? 'Pick a project' : undefined;

interface Values {
  title: string;
  description: string;
  priority: string;
  dueDate: Date | null;
  assignedTo: string;
  estimatedHours: number;
  projectId: number | null;
  isCompleted: boolean;
}

export default function TaskForm({
  projects,
  task
}: {
  projects: Lookup[];
  /** Absent in create mode. */
  task?: TaskRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEdit = Boolean(task);

  const initialValues: Values = {
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priorityName ?? 'Medium',
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
    assignedTo: task?.assignedTo ?? '',
    estimatedHours: task?.estimatedHours ?? 4,
    projectId: task?.projectId ?? (projects[0]?.id ?? null),
    isCompleted: task?.isCompleted ?? false
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const v2 = values as unknown as Values;
    const payload = {
      title: v2.title,
      description: v2.description ?? '',
      priority: v2.priority,
      dueDate: v2.dueDate ? new Date(v2.dueDate).toISOString() : null,
      assignedTo: v2.assignedTo ?? '',
      estimatedHours: Number(v2.estimatedHours ?? 0),
      projectId: v2.projectId ?? null,
      isCompleted: v2.isCompleted ?? false
    };

    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateTask(task!.id, payload)
        : await createTask(payload);

      if (!result.ok) {
        setError(
          result.errors
            ? Object.entries(result.errors).map(([k, m]) => `${k}: ${m}`).join(' | ')
            : result.message ?? 'Save failed'
        );
        return;
      }
      router.push('/tasks');
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask(task!.id);
      if (!result.ok) {
        setError(result.message ?? 'Delete failed');
        setConfirmDelete(false);
        return;
      }
      router.push('/tasks');
    });
  };

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}

      <Form
        initialValues={initialValues as unknown as Record<string, unknown>}
        onSubmit={handleSubmit}
        render={(formProps: FormRenderProps) => (
          <FormElement>
            <div className="form-grid">
              <Field
                id="title"
                name="title"
                label="Title *"
                hint="3-200 characters"
                component={FormInput}
                validator={v.title}
              />
              <Field
                id="projectId"
                name="projectId"
                label="Project *"
                component={FormDropDown}
                data={projects}
                textField="label"
                dataItemKey="id"
                valuePrimitive
                validator={requiredProject}
              />
              <Field
                id="priority"
                name="priority"
                label="Priority"
                component={FormDropDown}
                data={PRIORITIES}
              />
              <Field
                id="assignedTo"
                name="assignedTo"
                label="Assignee"
                hint="Leave blank to triage later"
                component={FormInput}
                validator={v.assignedTo}
              />
              <Field
                id="dueDate"
                name="dueDate"
                label="Due date"
                component={FormDatePicker}
                format="dd MMM yyyy"
              />
              <Field
                id="estimatedHours"
                name="estimatedHours"
                label="Estimated hours"
                component={FormNumeric}
                min={0}
                max={1000}
                step={0.5}
                format="n1"
                validator={v.estimatedHours}
              />
              {isEdit && (
                <Field
                  id="isCompleted"
                  name="isCompleted"
                  label="Completed"
                  component={FormCheckbox}
                />
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <Field
                id="description"
                name="description"
                label="Description"
                hint="Up to 500 characters"
                component={FormTextArea}
                validator={v.description}
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                themeColor="primary"
                disabled={!formProps.allowSubmit || pending}
              >
                {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
              </Button>
              <Button type="button" onClick={() => formProps.onFormReset()} disabled={pending}>
                Reset
              </Button>
              <Button type="button" fillMode="flat" onClick={() => router.push('/tasks')}>
                Cancel
              </Button>
              {isEdit && (
                <>
                  <span className="toolbar-spacer" />
                  <Button
                    type="button"
                    themeColor="error"
                    fillMode="outline"
                    onClick={() => setConfirmDelete(true)}
                    disabled={pending}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>

            {!formProps.valid && formProps.touched && (
              <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                Fix the highlighted fields before saving.
              </p>
            )}
          </FormElement>
        )}
      />

      {confirmDelete && (
        <Dialog title="Delete task" onClose={() => setConfirmDelete(false)}>
          <p style={{ margin: 0, maxWidth: 340 }}>
            Delete <strong>{task?.title}</strong>? This cannot be undone.
          </p>
          <DialogActionsBar>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button themeColor="error" onClick={handleDelete} disabled={pending}>
              Delete
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
