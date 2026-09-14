<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="cancel"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-sm animate-[popIn_0.2s_ease-out]"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"
          >
            <span class="text-red-600 text-xl font-bold">!</span>
          </div>
          <div>
            <h3 class="font-display text-lg font-bold text-stone-800">
              {{ title }}
            </h3>
            <p class="text-sm text-stone-500 mt-1">{{ message }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancel"
            class="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            class="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const title = ref("Confirm");
const message = ref("Are you sure?");
let resolvePromise = null;

function open(opts = {}) {
  title.value = opts.title || "Confirm Delete";
  message.value = opts.message || "Are you sure you want to delete this item?";
  visible.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
}

function confirm() {
  visible.value = false;
  resolvePromise?.(true);
}

function cancel() {
  visible.value = false;
  resolvePromise?.(false);
}

defineExpose({ open });
</script>

<style>
@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
