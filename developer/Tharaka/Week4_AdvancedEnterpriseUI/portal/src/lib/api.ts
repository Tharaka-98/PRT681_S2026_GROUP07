/**
 * Server-side API client.
 *
 * Everything here runs on the Node side of Next.js, so the API base URL never
 * reaches the browser. Client components talk to /api/proxy/* instead, which
 * keeps the browser on one origin and sidesteps CORS completely.
 */
import type {
  DashboardSummary, Lookup, Paged, ProjectRow, SchedulerEvent, TaskFact, TaskRow
} from './types';

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5145';

type CacheMode = 'no-store' | 'force-cache' | number;

function cacheOptions(mode: CacheMode): RequestInit {
  if (mode === 'no-store') return { cache: 'no-store' };
  if (mode === 'force-cache') return { cache: 'force-cache' };
  return { next: { revalidate: mode } };     // ISR: revalidate every N seconds
}

export async function apiGet<T>(path: string, mode: CacheMode = 'no-store'): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...cacheOptions(mode),
    headers: { Accept: 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T | null> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const problem = await res.json();
      if (problem?.errors) {
        detail = Object.entries(problem.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join(' | ');
      } else if (problem?.message) {
        detail = problem.message;
      }
    } catch {
      /* body was not JSON - keep the status text */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------- typed reads

export const getTasksPage = (qs: string) =>
  apiGet<Paged<TaskRow>>(`/api/tasks${qs ? `?${qs}` : ''}`);

export const getTask = (id: number) => apiGet<TaskRow>(`/api/tasks/${id}`);

export const getProjectsPage = (qs: string) =>
  apiGet<Paged<ProjectRow>>(`/api/projects${qs ? `?${qs}` : ''}`);

export const getProjectLookup = () => apiGet<Lookup[]>('/api/projects/lookup', 60);

export const getAssignees = () => apiGet<string[]>('/api/tasks/assignees', 60);

export const getSummary = () => apiGet<DashboardSummary>('/api/analytics/summary');

export const getTaskFacts = () => apiGet<TaskFact[]>('/api/analytics/task-facts', 300);

export const getSchedule = () => apiGet<SchedulerEvent[]>('/api/tasks/schedule');

export const getHealth = () =>
  apiGet<{ status: string; database: string; utc: string }>('/api/health');
