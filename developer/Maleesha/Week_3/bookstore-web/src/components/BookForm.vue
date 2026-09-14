<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="block text-sm font-semibold text-stone-700 mb-1"
        >Title</label
      >
      <input
        v-model="form.title"
        @blur="touched.title = true"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
        :class="
          showError('title')
            ? 'border-red-400 focus:ring-red-300'
            : 'border-stone-300 focus:ring-amber-400'
        "
      />
      <p v-if="showError('title')" class="text-red-600 text-xs mt-1">
        Title is required.
      </p>
    </div>

    <div>
      <label class="block text-sm font-semibold text-stone-700 mb-1"
        >Author</label
      >
      <select
        v-model="form.authorId"
        @blur="touched.authorId = true"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
        :class="
          showError('authorId')
            ? 'border-red-400 focus:ring-red-300'
            : 'border-stone-300 focus:ring-amber-400'
        "
      >
        <option value="">Select an author</option>
        <option v-for="a in authors" :key="a.id" :value="a.id">
          {{ a.name }}
        </option>
      </select>
      <p v-if="showError('authorId')" class="text-red-600 text-xs mt-1">
        Please select an author.
      </p>
    </div>

    <div>
      <label class="block text-sm font-semibold text-stone-700 mb-1"
        >Genre</label
      >
      <input
        v-model="form.genre"
        @blur="touched.genre = true"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
        :class="
          showError('genre')
            ? 'border-red-400 focus:ring-red-300'
            : 'border-stone-300 focus:ring-amber-400'
        "
      />
      <p v-if="showError('genre')" class="text-red-600 text-xs mt-1">
        Genre is required.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-stone-700 mb-1"
          >Price ($)</label
        >
        <input
          type="number"
          step="0.01"
          min="0"
          v-model.number="form.price"
          @blur="touched.price = true"
          class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          :class="
            showError('price')
              ? 'border-red-400 focus:ring-red-300'
              : 'border-stone-300 focus:ring-amber-400'
          "
        />
        <p v-if="showError('price')" class="text-red-600 text-xs mt-1">
          Enter a valid price.
        </p>
      </div>
      <div>
        <label class="block text-sm font-semibold text-stone-700 mb-1"
          >Stock</label
        >
        <input
          type="number"
          min="0"
          v-model.number="form.stock"
          @blur="touched.stock = true"
          class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          :class="
            showError('stock')
              ? 'border-red-400 focus:ring-red-300'
              : 'border-stone-300 focus:ring-amber-400'
          "
        />
        <p v-if="showError('stock')" class="text-red-600 text-xs mt-1">
          Enter valid stock.
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800"
      >
        Save
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from "vue";

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({ title: "", authorId: "", genre: "", price: 0, stock: 0 }),
  },
  authors: { type: Array, default: () => [] },
});
const emit = defineEmits(["submit", "cancel"]);

const form = reactive({ ...props.initial });
const touched = reactive({
  title: false,
  authorId: false,
  genre: false,
  price: false,
  stock: false,
});

const errors = computed(() => ({
  title: !form.title || !form.title.trim(),
  authorId: !form.authorId,
  genre: !form.genre || !form.genre.trim(),
  price: form.price === "" || form.price === null || form.price < 0,
  stock: form.stock === "" || form.stock === null || form.stock < 0,
}));

function showError(field) {
  return touched[field] && errors.value[field];
}

function submit() {
  Object.keys(touched).forEach((k) => (touched[k] = true));
  const hasError = Object.values(errors.value).some(Boolean);
  if (hasError) return;
  emit("submit", { ...form });
}
</script>
