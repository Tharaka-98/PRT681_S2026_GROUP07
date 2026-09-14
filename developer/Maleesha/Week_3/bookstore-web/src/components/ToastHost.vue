<template>
  <div
    class="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:top-4 sm:right-4 max-sm:left-4 max-sm:bottom-4 max-sm:top-auto"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      @click="dismiss(toast.id)"
      class="px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg cursor-pointer animate-[slideIn_0.25s_ease-out] max-w-xs"
      :class="toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'"
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

<style>
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
</style>
