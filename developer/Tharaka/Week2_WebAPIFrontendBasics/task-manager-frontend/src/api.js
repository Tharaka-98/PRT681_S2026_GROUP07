const API_BASE = 'http://localhost:5145/api/tasks';

export async function fetchTasks() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(title, description) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function toggleTask(id) {
  const res = await fetch(`${API_BASE}/${id}/toggle`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to toggle task');
  return res.json();
}
