'use server';

import { revalidatePath } from 'next/cache';
import { apiSend } from '@/lib/api';
import { formErrors, projectSchema } from '@/lib/validation';
import type { ProjectRow } from '@/lib/types';
import type { ActionResult } from './tasks';

interface ProjectInput {
  name: string;
  code: string;
  owner: string;
  startDate: string;
  isActive: boolean;
}

function validate(input: ProjectInput) {
  return formErrors(projectSchema, { ...input, startDate: new Date(input.startDate) });
}

function refresh() {
  revalidatePath('/projects');
  revalidatePath('/');
  revalidatePath('/analytics');
}

export async function createProject(input: ProjectInput): Promise<ActionResult> {
  const errors = validate(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const created = await apiSend<ProjectRow>('/api/projects', 'POST', input);
    refresh();
    return { ok: true, id: created?.id, message: 'Project created' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function updateProject(id: number, input: ProjectInput): Promise<ActionResult> {
  const errors = validate(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    await apiSend<ProjectRow>(`/api/projects/${id}`, 'PUT', input);
    refresh();
    return { ok: true, id, message: 'Project updated' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function deleteProject(id: number): Promise<ActionResult> {
  try {
    await apiSend(`/api/projects/${id}`, 'DELETE');
    refresh();
    return { ok: true, message: 'Project deleted' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
