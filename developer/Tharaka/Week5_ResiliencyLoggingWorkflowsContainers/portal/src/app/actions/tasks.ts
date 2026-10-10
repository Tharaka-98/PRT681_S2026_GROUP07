'use server';

/**
 * Server Actions - the App Router way to mutate data without hand-writing an
 * API route for every form. Each action re-validates with the shared zod
 * schema and then revalidates the affected route caches.
 */
import { revalidatePath } from 'next/cache';
import { apiSend } from '@/lib/api';
import { formErrors, taskSchema } from '@/lib/validation';
import type { TaskRow } from '@/lib/types';

export interface ActionResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  id?: number;
}

interface TaskInput {
  title: string;
  description: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string;
  estimatedHours: number;
  projectId: number | null;
  isCompleted?: boolean;
}

function validate(input: TaskInput) {
  return formErrors(taskSchema, {
    ...input,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    isCompleted: input.isCompleted ?? false
  });
}

function refresh() {
  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/analytics');
  revalidatePath('/schedule');
  revalidatePath('/reports');
}

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const errors = validate(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const created = await apiSend<TaskRow>('/api/tasks', 'POST', input);
    refresh();
    return { ok: true, id: created?.id, message: 'Task created' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function updateTask(id: number, input: TaskInput): Promise<ActionResult> {
  const errors = validate(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    await apiSend<TaskRow>(`/api/tasks/${id}`, 'PUT', input);
    refresh();
    revalidatePath(`/tasks/${id}/edit`);
    return { ok: true, id, message: 'Task updated' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteTask(id: number): Promise<ActionResult> {
  try {
    await apiSend(`/api/tasks/${id}`, 'DELETE');
    refresh();
    return { ok: true, message: 'Task deleted' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function toggleTask(id: number): Promise<ActionResult> {
  try {
    await apiSend(`/api/tasks/${id}/toggle`, 'PATCH');
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function bulkTaskAction(
  action: 'complete' | 'reopen' | 'delete',
  ids: number[]
): Promise<ActionResult> {
  if (ids.length === 0) return { ok: false, message: 'Select at least one row' };

  try {
    const res = await apiSend<{ affected: number }>('/api/tasks/bulk', 'POST', { action, ids });
    refresh();
    return { ok: true, message: `${action} applied to ${res?.affected ?? ids.length} task(s)` };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
