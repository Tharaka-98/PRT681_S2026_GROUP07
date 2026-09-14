<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-stone-800">
          Books
        </h2>
        <p class="text-stone-500 text-sm mt-1">
          {{ books.length }} title{{ books.length !== 1 ? "s" : "" }} on the
          shelf
        </p>
      </div>
      <button
        @click="openAdd"
        class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white font-semibold shadow-md shadow-amber-900/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        + Add Book
      </button>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 text-stone-400 gap-3"
    >
      <div
        class="w-8 h-8 border-3 border-stone-200 border-t-amber-700 rounded-full animate-spin"
      ></div>
      <span class="text-sm">Loading books...</span>
    </div>

    <div
      v-else-if="books.length === 0"
      class="text-center py-20 text-stone-400"
    >
      <p class="text-lg font-medium">No books yet</p>
      <p class="text-sm mt-1">Add your first title to get started</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="group bg-white rounded-2xl shadow-sm border border-stone-200/70 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <div
          class="h-36 relative flex items-center px-5"
          :style="{
            background: `linear-gradient(135deg, ${book.coverColor || '#92400e'}, ${shade(book.coverColor)})`,
          }"
        >
          <div class="absolute left-0 top-0 bottom-0 w-2 bg-black/20"></div>
          <p
            class="font-display text-white font-bold text-lg leading-tight drop-shadow-sm line-clamp-3 pl-2"
          >
            {{ book.title }}
          </p>
        </div>
        <div class="p-5">
          <p class="text-sm text-stone-500">{{ authorName(book.authorId) }}</p>
          <span
            class="inline-block text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full mt-2"
          >
            {{ book.genre }}
          </span>
          <div
            class="flex items-center justify-between mt-4 pt-4 border-t border-stone-100"
          >
            <span class="text-xl font-bold text-stone-800"
              >${{ book.price.toFixed(2) }}</span
            >
            <span class="text-xs text-stone-400"
              >{{ book.stock }} in stock</span
            >
          </div>
          <div class="flex gap-2 mt-4">
            <button
              @click="openEdit(book)"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition"
            >
              Edit
            </button>
            <button
              @click="remove(book)"
              class="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-40"
      @click.self="showModal = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-md animate-[popIn_0.2s_ease-out]"
      >
        <h3 class="font-display text-xl font-bold text-stone-800 mb-5">
          {{ editing ? "Edit Book" : "Add Book" }}
        </h3>
        <BookForm
          :initial="formInitial"
          :authors="authors"
          @submit="save"
          @cancel="showModal = false"
        />
      </div>
    </div>
  </div>

  <ConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { booksApi, authorsApi } from "../services/api";
import BookForm from "./BookForm.vue";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps({ onToast: Function });

const books = ref([]);
const authors = ref([]);
const loading = ref(true);
const showModal = ref(false);
const confirmDialog = ref(null);
const editing = ref(null);
const formInitial = ref({
  title: "",
  authorId: "",
  genre: "",
  price: 0,
  stock: 0,
});

function authorName(id) {
  return authors.value.find((a) => a.id === id)?.name || "Unknown";
}

function shade(hex) {
  if (!hex) return "#451a03";
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - 40);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - 40);
  const b = Math.max(0, (num & 0x0000ff) - 40);
  return `rgb(${r}, ${g}, ${b})`;
}

async function load() {
  loading.value = true;
  try {
    [books.value, authors.value] = await Promise.all([
      booksApi.getAll(),
      authorsApi.getAll(),
    ]);
  } catch (err) {
    props.onToast?.("Failed to load books", "error");
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editing.value = null;
  formInitial.value = {
    title: "",
    authorId: "",
    genre: "",
    price: 0,
    stock: 0,
  };
  showModal.value = true;
}

function openEdit(book) {
  editing.value = book;
  formInitial.value = { ...book };
  showModal.value = true;
}

async function save(data) {
  try {
    if (editing.value) {
      await booksApi.update(editing.value.id, data);
      props.onToast?.("Book updated", "success");
    } else {
      await booksApi.create(data);
      props.onToast?.("Book added", "success");
    }
    showModal.value = false;
    await load();
  } catch (err) {
    props.onToast?.("Failed to save book", "error");
  }
}

async function remove(book) {
  const confirmed = await confirmDialog.value.open({
    title: "Delete Book",
    message: `Delete "${book.title}"? This can't be undone.`,
  });
  if (!confirmed) return;
  try {
    await booksApi.remove(book.id);
    props.onToast?.("Book deleted", "success");
    await load();
  } catch (err) {
    props.onToast?.("Failed to delete book", "error");
  }
}

onMounted(load);
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
