import { useEffect, useState } from "react";

type TaskItem = {
  id: number;
  title: string;
  isCompleted: boolean;
};

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");

  const apiUrl = "http://localhost:5227/api/tasks";

  async function loadTasks() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    setTasks(data);
  }

  async function addTask() {
    if (!title.trim()) return;

    await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        isCompleted: false,
      }),
    });

    setTitle("");
    loadTasks();
  }

  async function completeTask(task: TaskItem) {
    await fetch(`${apiUrl}/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: task.id,
        title: task.title,
        isCompleted: true,
      }),
    });

    loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`${apiUrl}/${id}`, {
      method: "DELETE",
    });

    loadTasks();
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h1>Task Manager</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={title}
          placeholder="Enter a new task"
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={addTask} style={{ marginLeft: "10px" }}>
          Add Task
        </button>
      </div>

      {tasks.map((task) => (
        <div key={task.id} style={{ marginBottom: "12px" }}>
          <span>
            {task.id}. {task.title} —{" "}
            {task.isCompleted ? "Completed" : "Pending"}
          </span>

          {!task.isCompleted && (
            <button
              onClick={() => completeTask(task)}
              style={{ marginLeft: "10px" }}
            >
              Complete
            </button>
          )}

          <button
            onClick={() => deleteTask(task.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;