const { useEffect, useState } = React;

const apiBaseUrl = "http://localhost:5080/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch(apiBaseUrl);
      const data = await response.json();
      setTasks(data);
      setMessage("");
    } catch {
      setMessage("Could not connect to the API. Start the ASP.NET Core project first.");
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Task title is required.");
      return;
    }

    await fetch(apiBaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    setTitle("");
    setDescription("");
    await loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${apiBaseUrl}/${id}`, { method: "DELETE" });
    await loadTasks();
  }

  async function toggleTask(task) {
    await fetch(`${apiBaseUrl}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        isComplete: !task.isComplete
      })
    });

    await loadTasks();
  }

  return (
    <>
      <section className="app-header">
        <h1>Week 2 Task Manager</h1>
        <p>React frontend calling an ASP.NET Core Web API with Entity Framework Core.</p>
      </section>

      <form className="task-form" onSubmit={addTask}>
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
          <p>No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <article className={`task-card ${task.isComplete ? "done" : ""}`} key={task.id}>
              <div>
                <h2>{task.title}</h2>
                <p>{task.description || "No description"}</p>
                <span className="status">{task.isComplete ? "Complete" : "Incomplete"}</span>
              </div>
              <div className="task-actions">
                <button className="ghost-button" onClick={() => toggleTask(task)}>
                  {task.isComplete ? "Undo" : "Done"}
                </button>
                <button className="danger-button" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
