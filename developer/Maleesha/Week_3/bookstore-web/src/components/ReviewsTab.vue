<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h2 class="text-xl font-bold text-stone-800">Reviews</h2>
      <button
        @click="openAdd"
        class="px-4 py-2 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800"
      >
        + Add Review
      </button>
    </div>

    <div v-if="loading" class="text-stone-500 py-10 text-center">
      Loading reviews...
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="r in reviews"
        :key="r.id"
        class="bg-white rounded-2xl shadow-sm border border-stone-200/70 p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="font-display font-bold text-stone-800 text-lg">
              {{ bookTitle(r.bookId) }}
            </h3>
            <p class="text-sm text-stone-500">by {{ r.reviewerName }}</p>
          </div>
          <div class="text-amber-500 text-lg tracking-wide">
            {{ "★".repeat(r.rating)
            }}<span class="text-stone-200">{{ "★".repeat(5 - r.rating) }}</span>
          </div>
        </div>
        <p class="text-sm text-stone-600 mt-3 italic" v-if="r.comment">
          "{{ r.comment }}"
        </p>
        <div class="flex gap-2 mt-4 pt-3 border-t border-stone-100">
          <button
            @click="remove(r)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-stone-800 mb-4">Add Review</h3>
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Book</label
            >
            <select
              v-model="form.bookId"
              @blur="touched.bookId = true"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              :class="
                touched.bookId && !form.bookId
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-stone-300 focus:ring-amber-400'
              "
            >
              <option value="">Select a book</option>
              <option v-for="b in books" :key="b.id" :value="b.id">
                {{ b.title }}
              </option>
            </select>
            <p
              v-if="touched.bookId && !form.bookId"
              class="text-red-600 text-xs mt-1"
            >
              Please select a book.
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Your Name</label
            >
            <input
              v-model="form.reviewerName"
              @blur="touched.reviewerName = true"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              :class="
                touched.reviewerName && !form.reviewerName.trim()
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-stone-300 focus:ring-amber-400'
              "
            />
            <p
              v-if="touched.reviewerName && !form.reviewerName.trim()"
              class="text-red-600 text-xs mt-1"
            >
              Name is required.
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Rating (1-5)</label
            >
            <input
              type="number"
              min="1"
              max="5"
              v-model.number="form.rating"
              @blur="touched.rating = true"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              :class="
                touched.rating && (form.rating < 1 || form.rating > 5)
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-stone-300 focus:ring-amber-400'
              "
            />
            <p
              v-if="touched.rating && (form.rating < 1 || form.rating > 5)"
              class="text-red-600 text-xs mt-1"
            >
              Rating must be 1-5.
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Comment (optional)</label
            >
            <textarea
              v-model="form.comment"
              rows="3"
              class="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="showModal = false"
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
      </div>
    </div>
  </div>

  <ConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { reviewsApi, booksApi } from "../services/api";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps({ onToast: Function });

const reviews = ref([]);
const books = ref([]);
const loading = ref(true);
const showModal = ref(false);
const confirmDialog = ref(null);
const form = reactive({ bookId: "", reviewerName: "", rating: 5, comment: "" });
const touched = reactive({ bookId: false, reviewerName: false, rating: false });

function bookTitle(id) {
  return books.value.find((b) => b.id === id)?.title || "Unknown Book";
}

async function load() {
  loading.value = true;
  try {
    [reviews.value, books.value] = await Promise.all([
      reviewsApi.getAll(),
      booksApi.getAll(),
    ]);
  } catch (err) {
    props.onToast?.("Failed to load reviews", "error");
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  Object.assign(form, { bookId: "", reviewerName: "", rating: 5, comment: "" });
  touched.bookId = false;
  touched.reviewerName = false;
  touched.rating = false;
  showModal.value = true;
}

async function save() {
  touched.bookId = true;
  touched.reviewerName = true;
  touched.rating = true;
  if (
    !form.bookId ||
    !form.reviewerName.trim() ||
    form.rating < 1 ||
    form.rating > 5
  )
    return;
  try {
    await reviewsApi.create({ ...form });
    props.onToast?.("Review added", "success");
    showModal.value = false;
    await load();
  } catch (err) {
    props.onToast?.("Failed to save review", "error");
  }
}

async function remove(review) {
  const confirmed = await confirmDialog.value.open({
    title: "Delete Review",
    message: `Delete this review by ${review.reviewerName}? This can't be undone.`,
  });
  if (!confirmed) return;
  try {
    await reviewsApi.remove(review.id);
    props.onToast?.("Review deleted", "success");
    await load();
  } catch (err) {
    props.onToast?.("Failed to delete review", "error");
  }
}

onMounted(load);
</script>
