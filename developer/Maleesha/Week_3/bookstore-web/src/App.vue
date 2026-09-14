<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Hero -->
    <header
      class="relative overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 text-amber-50"
    >
      <div
        class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]"
      ></div>
      <div
        class="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 sm:pt-14 sm:pb-8"
      >
        <p
          class="text-amber-300 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-2"
        >
          Est. Since Forever
        </p>
        <h1
          class="font-display text-3xl sm:text-5xl font-extrabold tracking-tight"
        >
          The Ink & Page
        </h1>
        <p class="text-amber-200/80 text-sm sm:text-base mt-2 max-w-md">
          Curated titles, honest reviews, and timeless stories worth shelving.
        </p>
      </div>

      <nav
        class="relative border-t border-amber-800/60 bg-black/10 backdrop-blur-sm"
      >
        <div
          class="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="relative px-4 sm:px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors"
            :class="
              activeTab === tab.key
                ? 'text-white'
                : 'text-amber-300/60 hover:text-amber-100'
            "
          >
            {{ tab.label }}
            <span
              v-if="activeTab === tab.key"
              class="absolute left-0 right-0 -bottom-px h-0.5 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full"
            ></span>
          </button>
        </div>
      </nav>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <BooksTab v-if="activeTab === 'books'" :on-toast="showToast" />
      <AuthorsTab v-else-if="activeTab === 'authors'" :on-toast="showToast" />
      <ReviewsTab v-else :on-toast="showToast" />
    </main>

    <footer class="text-center text-xs text-stone-400 pb-8">
      Developed By Maleesha Sulakshana Jayasinghe
    </footer>

    <ToastHost ref="toastHost" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ToastHost from "./components/ToastHost.vue";
import BooksTab from "./components/BooksTab.vue";
import AuthorsTab from "./components/AuthorsTab.vue";
import ReviewsTab from "./components/ReviewsTab.vue";

const activeTab = ref("books");
const toastHost = ref(null);
function showToast(message, type) {
  toastHost.value?.show(message, type);
}

const tabs = [
  { key: "books", label: "Books" },
  { key: "authors", label: "Authors" },
  { key: "reviews", label: "Reviews" },
];
</script>
