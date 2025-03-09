<template>
  <div class="container mx-auto max-w-3xl p-6 rounded-lg shadow-md bg-fill">
    <h1 class="text-3xl font-bold text-center text-color-base mb-6">Semantic Search</h1>
    
    <!-- Database items -->
    <div class="mb-6">
      <div class="p-3 font-semibold rounded-t-md border border-border bg-card">Items in database:</div>
      <div class="flex flex-wrap gap-2 p-3 border border-border border-t-0 rounded-b-md bg-card-muted">
        <span v-for="(item, idx) in items" :key="idx" 
              class="px-3 py-1 rounded-full text-sm bg-fill text-color-base border border-border">
          {{ item }}
        </span>
      </div>
    </div>
    
    <!-- Search input -->
    <div class="flex mb-5">
      <input v-model="query" placeholder="Enter your search query..." @keyup.enter="search" 
             class="flex-1 p-3 border border-border rounded text-color-base bg-card text-color-base">
      <button @click="search" 
             class="ml-3 px-5 py-3 bg-accent hover:bg-accent-hover text-color-base font-medium rounded">
        Search
      </button>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="my-5 p-4 rounded-md border border-border bg-card">
      <div class="text-center italic text-color-base">
        <div class="mb-2 font-medium">Loading model and computing embeddings...</div>
        <div class="text-sm">Status: {{ modelStatus }}</div>
      </div>
      
      <div v-if="modelStatus.includes('Downloading')" class="mt-3">
        <div class="text-xs text-color-base-muted mb-1">This might take a moment on first load as the model is downloaded (~40MB)</div>
        <div class="w-full bg-fill rounded-full h-2">
          <div class="bg-accent h-2 rounded-full" :style="{ width: `${loadingProgress}%` }"></div>
        </div>
      </div>
    </div>
    
    <!-- Search results -->
    <div v-if="searchResults.length > 0" class="mt-5 mb-6">
      <div class="p-3 font-semibold rounded-t-md border border-border bg-card">Top 3 Results:</div>
      <div class="border border-border border-t-0 rounded-b-md bg-card-muted">
        <div v-for="(result, idx) in searchResults" :key="idx" 
             class="p-3 border-b border-border last:border-b-0 flex justify-between items-center">
          <span class="font-medium text-color-base">{{ result.item }}</span>
          <div>
            <span class="text-sm" :class="[getSimilarityClass(result.similarity), 'text-color-base']">
              {{ (result.similarity * 100).toFixed(1) }}% similar
            </span>
            <div class="w-24 h-2 bg-fill rounded-full">
              <div class="h-2 rounded-full bg-accent" 
                   :style="{ width: `${result.similarity * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSemanticSearch } from '../composables/useSemanticSearch';

// Initialize with default items
const {
  items,
  query,
  searchResults,
  loading,
  modelStatus,
  loadingProgress,
  search
} = useSemanticSearch([
  "Bed", "Car", "Train", "Cat", "Dog", "Apple", 
  "Boat", "Mouse", "Chair", "Table", "Laptop", "Bird"
]);

const getSimilarityClass = (similarity: number): string => {
  if (similarity > 0.8) return 'text-accent font-medium';
  if (similarity > 0.5) return 'text-accent-muted';
  if (similarity > 0.3) return 'text-color-base';
  return 'text-color-base-muted';
};
</script>

<style>
.bg-fill {
  background-color: var(--color-fill);
}

.bg-card {
  background-color: var(--color-card);
}

.bg-card-muted {
  background-color: var(--color-card-muted);
}

.bg-accent {
  background-color: var(--color-accent);
}

.hover\:bg-accent-hover:hover {
  background-color: var(--color-accent-hover);
}

.text-color-base {
  color: var(--color-text-base);
}

.text-color-base-muted {
  color: var(--color-text-base-muted);
}

.text-accent {
  color: var(--color-accent);
}

.text-accent-muted {
  color: var(--color-accent-hover);
}

.border-border {
  border-color: var(--color-border);
}
</style> 