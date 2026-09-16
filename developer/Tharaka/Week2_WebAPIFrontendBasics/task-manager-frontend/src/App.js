import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, deleteTask, toggleTask } from './api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setError('');
    } catch {
      setError('Could not connect to API. Make sure the backend is running on http://localhost:5145');
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      loadTasks();
    } catch {
      setError('Failed to add task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      loadTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleTask(id);
      loadTasks();
    } catch {
      setError('Failed to toggle task');
    }
  };

  return (
    <div className="app">
      <h1>Task Manager</h1>
      <p className="subtitle">ASP.NET Core Web API + React Frontend</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <div className="task-list">
        {tasks.length === 0 && !error && <p className="empty">No tasks yet. Add one above!</p>}
        {tasks.map((task) => (
          <div key={task.id} className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
            <div className="task-info">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => handleToggle(task.id)}
              />
              <div>
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
                <small>{new Date(task.createdAt).toLocaleString()}</small>
              </div>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(task.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
