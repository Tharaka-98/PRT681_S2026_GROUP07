<template>
  <div class="page">
    <div class="app-shell">
      <header class="app-header">
        <h1>Data Manager</h1>
        <p class="subtitle">Products, Employees, and Books in one place</p>
      </header>

      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="tab-content">
        <EntityManager
          v-if="activeTab === 'products'"
          title="Products"
          singular-label="Product"
          :api="productsApi"
          :fields="productFields"
          :columns="productColumns"
          :on-toast="showToast"
        />
        <EntityManager
          v-else-if="activeTab === 'employees'"
          title="Employees"
          singular-label="Employee"
          :api="employeesApi"
          :fields="employeeFields"
          :columns="employeeColumns"
          :on-toast="showToast"
        />
        <EntityManager
          v-else
          title="Books"
          singular-label="Book"
          :api="booksApi"
          :fields="bookFields"
          :columns="bookColumns"
          :on-toast="showToast"
        />
      </div>
    </div>

    <ToastHost ref="toastHost" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import EntityManager from "./components/EntityManager.vue";
import ToastHost from "./components/ToastHost.vue";
import { productsApi, employeesApi, booksApi } from "./services/api";

const activeTab = ref("products");
const toastHost = ref(null);

function showToast(message, type) {
  toastHost.value?.show(message, type);
}

const tabs = [
  { key: "products", label: "Products" },
  { key: "employees", label: "Employees" },
  { key: "books", label: "Books" },
];

const productFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "price", label: "Price", type: "number" },
  { name: "category", label: "Category", type: "text" },
  { name: "inStock", label: "In Stock", type: "checkbox" },
];

const productColumns = [
  { field: "name", title: "Name" },
  { field: "price", title: "Price", format: "{0:c}" },
  { field: "category", title: "Category" },
  { field: "inStock", title: "In Stock" },
];

const employeeFields = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "salary", label: "Salary", type: "number" },
  { name: "hireDate", label: "Hire Date", type: "date" },
];

const employeeColumns = [
  { field: "fullName", title: "Full Name" },
  { field: "department", title: "Department" },
  { field: "salary", title: "Salary", format: "{0:c}" },
  { field: "hireDate", title: "Hire Date" },
];

const bookFields = [
  { name: "title", label: "Title", type: "text" },
  { name: "author", label: "Author", type: "text" },
  { name: "genre", label: "Genre", type: "text" },
  { name: "publishedYear", label: "Published Year", type: "number" },
];

const bookColumns = [
  { field: "title", title: "Title" },
  { field: "author", title: "Author" },
  { field: "genre", title: "Genre" },
  { field: "publishedYear", title: "Year" },
];
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.app-shell {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  padding: 32px;
  width: 100%;
  max-width: 1000px;
  box-sizing: border-box;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
}

.app-header h1 {
  margin: 0;
  font-size: 26px;
  color: #2d2d2d;
}

.subtitle {
  margin: 6px 0 0;
  color: #888;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f5;
  flex-wrap: wrap;
}

.tab-button {
  background: none;
  border: none;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.tab-button.active {
  color: #764ba2;
  border-bottom-color: #764ba2;
}

.tab-button:hover {
  color: #667eea;
}

@media (max-width: 600px) {
  .page {
    padding: 12px;
  }

  .app-shell {
    padding: 20px 16px;
  }

  .app-header h1 {
    font-size: 20px;
  }

  .tabs {
    justify-content: space-between;
  }

  .tab-button {
    flex: 1;
    padding: 10px 8px;
    font-size: 13px;
  }
}
</style>
