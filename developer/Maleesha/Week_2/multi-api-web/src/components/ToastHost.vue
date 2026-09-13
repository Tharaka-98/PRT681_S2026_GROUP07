<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type === 'success' ? 'toast-success' : 'toast-error'"
      @click="dismiss(toast.id)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const toasts = ref([]);
let nextId = 0;

function show(message, type = "success") {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  setTimeout(() => dismiss(id), 3000);
}

function dismiss(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

defineExpose({ show });
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

.toast {
  padding: 14px 18px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  animation: slideIn 0.25s ease-out;
  max-width: 320px;
}

.toast-success {
  background: #2ecc71;
}

.toast-error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 600px) {
  .toast-container {
    top: auto;
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  .toast {
    max-width: none;
  }
}
</style>
