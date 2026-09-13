<script setup lang="ts">
import { onMounted, ref } from "vue";

type TaskItem = {
  id: number;
  title: string;
  isCompleted: boolean;
};

const tasks = ref<TaskItem[]>([]);
const title = ref("");

const apiUrl = "http://localhost:5227/api/tasks";

async function loadTasks() {
  const response = await fetch(apiUrl);
  tasks.value = await response.json();
}

async function addTask() {
  if (!title.value.trim()) return;

  await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title.value,
      isCompleted: false,
    }),
  });

  title.value = "";
  await loadTasks();
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

  await loadTasks();
}

async function deleteTask(id: number) {
  await fetch(`${apiUrl}/${id}`, {
    method: "DELETE",
  });

  await loadTasks();
}

onMounted(() => {
  loadTasks();
});
</script>

<template>
  <main class="container">
    <h1>Vue Task Manager</h1>

    <div class="add-task">
      <input
        v-model="title"
        type="text"
        placeholder="Enter a new task"
        @keyup.enter="addTask"
      />

      <button @click="addTask">
        Add Task
      </button>
    </div>

    <div
      v-for="task in tasks"
      :key="task.id"
      class="task"
    >
      <span>
        {{ task.id }}. {{ task.title }} —
        {{ task.isCompleted ? "Completed" : "Pending" }}
      </span>

      <button
        v-if="!task.isCompleted"
        @click="completeTask(task)"
      >
        Complete
      </button>

      <button @click="deleteTask(task.id)">
        Delete
      </button>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 700px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
}

.add-task {
  margin-bottom: 20px;
}

input {
  padding: 8px;
  width: 300px;
}

button {
  margin-left: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.task {
  margin-bottom: 12px;
}
</style>