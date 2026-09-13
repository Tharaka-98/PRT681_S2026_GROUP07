<template>
  <div class="entity-manager">
    <div class="entity-header">
      <h2>{{ title }}</h2>
      <k-button theme-color="primary" @click="openAddForm"
        >+ Add {{ singularLabel }}</k-button
      >
    </div>

    <div class="status" v-if="loading">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>

    <div class="grid-wrapper" v-else>
      <k-grid
        :data-items="items"
        :columns="gridColumns"
        class="responsive-grid"
      >
        <template v-slot:dateCell="{ props }">
          <td>{{ formatDisplayDate(props.dataItem[props.field]) }}</td>
        </template>
        <template v-slot:actionsCell="{ props }">
          <td>
            <k-button size="small" @click="openEditForm(props.dataItem)"
              >Edit</k-button
            >
            <k-button
              size="small"
              theme-color="error"
              @click="confirmDelete(props.dataItem)"
              >Delete</k-button
            >
          </td>
        </template>
      </k-grid>
    </div>

    <k-dialog
      v-if="showForm"
      :title="
        formMode === 'add' ? `Add ${singularLabel}` : `Edit ${singularLabel}`
      "
      @close="closeForm"
    >
      <form class="entity-form" @submit.prevent="submitForm">
        <div class="form-field" v-for="field in fields" :key="field.name">
          <label>{{ field.label }}</label>
          <k-input
            v-if="field.type === 'text' || field.type === 'number'"
            :type="field.type"
            v-model="formData[field.name]"
          />
          <input
            v-else-if="field.type === 'checkbox'"
            type="checkbox"
            v-model="formData[field.name]"
          />
          <input
            v-else-if="field.type === 'date'"
            type="date"
            v-model="formData[field.name]"
          />
        </div>
      </form>
      <DialogActionsBar>
        <k-button @click="closeForm">Cancel</k-button>
        <k-button theme-color="primary" @click="submitForm">Save</k-button>
      </DialogActionsBar>
    </k-dialog>

    <k-dialog
      v-if="showDeleteConfirm"
      title="Confirm Delete"
      @close="showDeleteConfirm = false"
    >
      <p>
        Are you sure you want to delete this {{ singularLabel.toLowerCase() }}?
      </p>
      <DialogActionsBar>
        <k-button @click="showDeleteConfirm = false">Cancel</k-button>
        <k-button theme-color="error" @click="doDelete">Delete</k-button>
      </DialogActionsBar>
    </k-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Grid as KGrid } from "@progress/kendo-vue-grid";
import { Button as KButton } from "@progress/kendo-vue-buttons";
import { Input as KInput } from "@progress/kendo-vue-inputs";
import {
  Dialog as KDialog,
  DialogActionsBar,
} from "@progress/kendo-vue-dialogs";

const props = defineProps({
  title: String,
  singularLabel: String,
  api: Object,
  fields: Array, // [{ name, label, type }]
  columns: Array, // kendo grid column defs
  onToast: Function,
});

const items = ref([]);
const loading = ref(true);
const showForm = ref(false);
const formMode = ref("add");
const formData = ref({});
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

// Mark grid columns that correspond to date fields so they use the dateCell template
const dateFieldNames = new Set(
  props.fields.filter((f) => f.type === "date").map((f) => f.name),
);

const gridColumns = [
  ...props.columns.map((col) =>
    dateFieldNames.has(col.field) ? { ...col, cell: "dateCell" } : col,
  ),
  { cell: "actionsCell", title: "Actions", width: "160px" },
];

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

async function fetchItems() {
  loading.value = true;
  try {
    items.value = await props.api.getAll();
  } catch (err) {
    props.onToast?.("Failed to load data", "error");
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function openAddForm() {
  formMode.value = "add";
  const blank = {};
  props.fields.forEach((f) => {
    blank[f.name] = f.type === "checkbox" ? false : "";
  });
  formData.value = blank;
  showForm.value = true;
}

function openEditForm(item) {
  formMode.value = "edit";
  const copy = { ...item };
  props.fields.forEach((f) => {
    if (f.type === "date" && copy[f.name]) {
      copy[f.name] = toDateInputValue(copy[f.name]);
    }
  });
  formData.value = copy;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
}

async function submitForm() {
  try {
    if (formMode.value === "add") {
      await props.api.create(formData.value);
      props.onToast?.(`${props.singularLabel} added`, "success");
    } else {
      await props.api.update(formData.value.id, formData.value);
      props.onToast?.(`${props.singularLabel} updated`, "success");
    }
    showForm.value = false;
    await fetchItems();
  } catch (err) {
    props.onToast?.(
      `Failed to save ${props.singularLabel.toLowerCase()}`,
      "error",
    );
    console.error(err);
  }
}

function confirmDelete(item) {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
}

async function doDelete() {
  try {
    await props.api.remove(itemToDelete.value.id);
    props.onToast?.(`${props.singularLabel} deleted`, "success");
    showDeleteConfirm.value = false;
    await fetchItems();
  } catch (err) {
    props.onToast?.(
      `Failed to delete ${props.singularLabel.toLowerCase()}`,
      "error",
    );
    console.error(err);
  }
}

onMounted(fetchItems);
</script>

<style scoped>
.entity-manager {
  padding: 8px;
}

.entity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.entity-header h2 {
  margin: 0;
  font-size: 22px;
  color: #2d2d2d;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #888;
  padding: 30px 0;
  justify-content: center;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid #eee;
  border-top-color: #764ba2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grid-wrapper {
  overflow-x: auto;
  border-radius: 10px;
}

.entity-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px 0;
  min-width: 280px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

@media (max-width: 600px) {
  .entity-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
