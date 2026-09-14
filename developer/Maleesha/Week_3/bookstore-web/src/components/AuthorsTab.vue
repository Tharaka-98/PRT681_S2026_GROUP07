<template>
  <div>
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h2 class="text-xl font-bold text-stone-800">Authors</h2>
      <button
        @click="openAdd"
        class="px-4 py-2 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800"
      >
        + Add Author
      </button>
    </div>

    <div v-if="loading" class="text-stone-500 py-10 text-center">
      Loading authors...
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="a in authors"
        :key="a.id"
        class="bg-white rounded-2xl shadow-sm border border-stone-200/70 p-5 flex items-center justify-between gap-4 flex-wrap hover:shadow-md transition-shadow"
      >
        <div>
          <h3 class="font-display font-bold text-stone-800 text-lg">
            {{ a.name }}
          </h3>
          <p class="text-sm text-stone-500">{{ a.country }}</p>
          <p class="text-sm text-stone-600 mt-1" v-if="a.bio">{{ a.bio }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="openEdit(a)"
            class="px-3 py-1.5 text-sm rounded-lg border border-stone-300 hover:bg-stone-50"
          >
            Edit
          </button>
          <button
            @click="remove(a)"
            class="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
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
        <h3 class="text-lg font-bold text-stone-800 mb-4">
          {{ editing ? "Edit Author" : "Add Author" }}
        </h3>
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Name</label
            >
            <input
              v-model="form.name"
              @blur="touched.name = true"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              :class="
                touched.name && !form.name.trim()
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-stone-300 focus:ring-amber-400'
              "
            />
            <p
              v-if="touched.name && !form.name.trim()"
              class="text-red-600 text-xs mt-1"
            >
              Name is required.
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Country</label
            >
            <input
              v-model="form.country"
              @blur="touched.country = true"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              :class="
                touched.country && !form.country.trim()
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-stone-300 focus:ring-amber-400'
              "
            />
            <p
              v-if="touched.country && !form.country.trim()"
              class="text-red-600 text-xs mt-1"
            >
              Country is required.
            </p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-stone-700 mb-1"
              >Bio (optional)</label
            >
            <textarea
              v-model="form.bio"
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
import { authorsApi } from "../services/api";
import ConfirmDialog from "./ConfirmDialog.vue";

const props = defineProps({ onToast: Function });

const authors = ref([]);
const loading = ref(true);
const showModal = ref(false);
const confirmDialog = ref(null);
const editing = ref(null);
const form = reactive({ name: "", country: "", bio: "" });
const touched = reactive({ name: false, country: false });

async function load() {
  loading.value = true;
  try {
    authors.value = await authorsApi.getAll();
  } catch (err) {
    props.onToast?.("Failed to load authors", "error");
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editing.value = null;
  Object.assign(form, { name: "", country: "", bio: "" });
  touched.name = false;
  touched.country = false;
  showModal.value = true;
}

function openEdit(author) {
  editing.value = author;
  Object.assign(form, {
    name: author.name,
    country: author.country,
    bio: author.bio || "",
  });
  showModal.value = true;
}

async function save() {
  touched.name = true;
  touched.country = true;
  if (!form.name.trim() || !form.country.trim()) return;
  try {
    if (editing.value) {
      await authorsApi.update(editing.value.id, { ...form });
      props.onToast?.("Author updated", "success");
    } else {
      await authorsApi.create({ ...form });
      props.onToast?.("Author added", "success");
    }
    showModal.value = false;
    await load();
  } catch (err) {
    props.onToast?.("Failed to save author", "error");
  }
}

async function remove(author) {
  const confirmed = await confirmDialog.value.open({
    title: "Delete Author",
    message: `Delete "${author.name}"? This can't be undone.`,
  });
  if (!confirmed) return;
  try {
    await authorsApi.remove(author.id);
    props.onToast?.("Author deleted", "success");
    await load();
  } catch (err) {
    props.onToast?.("Failed to delete author", "error");
  }
}

onMounted(load);
</script>
