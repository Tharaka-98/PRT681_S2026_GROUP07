import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5080/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      const data = await response.json();
      setTasks(data);
      setMessage('');
    } catch {
      setMessage('Could not connect to the API. Start the .NET backend first (dotnet run).');
    }
  }

  async function createTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage('Task title is required.');
      return;
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      setMessage('Failed to create task.');
      return;
    }

    setTitle('');
    setDescription('');
    setMessage('');
    await loadTasks();
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  }

  async function saveEdit(task) {
    if (!editTitle.trim()) {
      setMessage('Task title is required.');
      return;
    }

    const response = await fetch(`${API_BASE}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        isCompleted: task.isCompleted,
      }),
    });

    if (!response.ok) {
      setMessage('Failed to update task.');
      return;
    }

    cancelEdit();
    setMessage('');
    await loadTasks();
  }

  async function toggleComplete(task) {
    await fetch(`${API_BASE}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        isCompleted: !task.isCompleted,
      }),
    });

    await loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    await loadTasks();
  }

  return (
    <main className="container">
      <header className="app-header">
        <h1>Tasks CRUD</h1>
        <p>React frontend with ASP.NET Core Web API and SQLite.</p>
      </header>

      <form className="task-form" onSubmit={createTask}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task title"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add Task</button>
      </form>

      {message && <p className="message">{message}</p>}

      <section className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks yet. Create one above.</p>
        ) : (
          tasks.map((task) => (
            <article
              className={`task-card ${task.isCompleted ? 'done' : ''}`}
              key={task.id}
            >
              {editingId === task.id ? (
                <div className="edit-form">
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="Title"
                  />
                  <input
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    placeholder="Description"
                  />
                  <div className="task-actions">
                    <button type="button" onClick={() => saveEdit(task)}>
                      Save
                    </button>
                    <button type="button" className="ghost-button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2>{task.title}</h2>
                    <p>{task.description || 'No description'}</p>
                    <span className="status">
                      {task.isCompleted ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button type="button" className="ghost-button" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="ghost-button" onClick={() => toggleComplete(task)}>
                      {task.isCompleted ? 'Undo' : 'Done'}
                    </button>
                    <button type="button" className="danger-button" onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
