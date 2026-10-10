'use client';

import { useState, useTransition } from 'react';
import { Form, FormElement, Field, FormRenderProps } from '@progress/kendo-react-form';
import { Button } from '@progress/kendo-react-buttons';
import { FormInput, FormDatePicker, FormCheckbox } from '@/components/form/FormComponents';
import { fieldValidator, projectSchema } from '@/lib/validation';
import type { ProjectRow } from '@/lib/types';
import { createProject, updateProject } from '@/app/actions/projects';

const v = {
  name: fieldValidator(projectSchema, 'name'),
  code: fieldValidator(projectSchema, 'code'),
  owner: fieldValidator(projectSchema, 'owner')
};

export default function ProjectForm({
  project,
  onDone,
  onCancel
}: {
  project?: ProjectRow;
  onDone: (message: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(project);

  const initialValues = {
    name: project?.name ?? '',
    code: project?.code ?? '',
    owner: project?.owner ?? '',
    startDate: project ? new Date(project.startDate) : new Date(),
    isActive: project?.isActive ?? true
  };

  const handleSubmit = (values: Record<string, unknown>) => {
    const payload = {
      name: String(values.name ?? ''),
      code: String(values.code ?? '').toUpperCase(),
      owner: String(values.owner ?? ''),
      startDate: new Date(values.startDate as Date).toISOString(),
      isActive: Boolean(values.isActive)
    };

    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateProject(project!.id, payload)
        : await createProject(payload);

      if (!result.ok) {
        setError(
          result.errors
            ? Object.entries(result.errors).map(([k, m]) => `${k}: ${m}`).join(' | ')
            : result.message ?? 'Save failed'
        );
        return;
      }
      await onDone(result.message ?? 'Saved');
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
              <Field id="code" name="code" label="Code *" hint="e.g. CPR-100" component={FormInput} validator={v.code} />
              <Field id="owner" name="owner" label="Owner *" component={FormInput} validator={v.owner} />
            </div>
            <div style={{ marginTop: 14 }}>
              <Field id="name" name="name" label="Name *" component={FormInput} validator={v.name} />
            </div>
            <div className="form-grid" style={{ marginTop: 14 }}>
              <Field id="startDate" name="startDate" label="Start date" component={FormDatePicker} format="dd MMM yyyy" />
              <Field id="isActive" name="isActive" label="Active" component={FormCheckbox} />
            </div>
            <div className="form-actions">
              <Button type="submit" themeColor="primary" disabled={!formProps.allowSubmit || pending}>
                {pending ? 'Saving...' : isEdit ? 'Save changes' : 'Create project'}
              </Button>
              <Button type="button" fillMode="flat" onClick={onCancel}>Cancel</Button>
            </div>
          </FormElement>
        )}
      />
    </>
  );
}
