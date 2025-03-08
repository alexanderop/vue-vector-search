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
import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * SEMANTIC SEARCH COMPONENT
 * 
 * This component demonstrates how semantic search works using transformer-based embeddings.
 * It uses the Hugging Face Transformers.js library in a web worker to generate vector embeddings
 * for text and performs similarity search using cosine similarity.
 */

// Types
type Embedding = number[]; // Type for vector embeddings
type SearchResult = { item: string; similarity: number };

/**
 * Composable for semantic search functionality
 */
function useSemanticSearch(initialItems: string[]) {
  const items = ref<string[]>(initialItems);
  const embeddings = ref<Embedding[]>([]);
  const worker = ref<Worker | null>(null);
  
  // Search state
  const query = ref<string>("");
  const searchResults = ref<SearchResult[]>([]);
  
  // UI state
  const loading = ref<boolean>(false);
  const modelStatus = ref<string>("Not started");
  const loadingProgress = ref<number>(0);
  
  /**
   * Initialize the worker and model
   */
  const initWorker = (): void => {
    // Create the web worker
    worker.value = new Worker(new URL('../workers/embeddingWorker.js', import.meta.url), { type: 'module' });
    
    // Set up message handler
    worker.value.onmessage = (e) => {
      const { status, ...data } = e.data;
      
      switch (status) {
        case 'debug':
          console.log('Worker debug:', data.message, data);
          break;
          
        case 'progress':
          // Update progress information with proper clamping
          if (data.progress !== undefined) {
            // Ensure progress is always between 0-100%
            loadingProgress.value = Math.min(Math.round(data.progress * 100), 100);
            modelStatus.value = `${data.status}: ${loadingProgress.value}%`;
          } else if (data.message) {
            modelStatus.value = data.message;
          } else {
            modelStatus.value = data.status || "Processing...";
          }
          break;
          
        case 'initialized':
          console.log('Model initialized, generating embeddings');
          // Model has been initialized, generate embeddings for items
          generateEmbeddings();
          break;
          
        case 'embeddingsGenerated':
          console.log('Embeddings generated:', data.embeddings.length);
          // Embeddings have been generated
          embeddings.value = data.embeddings;
          modelStatus.value = "Ready";
          loading.value = false;
          break;
          
        case 'searchResults':
          console.log('Search results received:', data.results);
          // Search results are ready
          searchResults.value = data.results;
          loading.value = false;
          break;
          
        case 'error':
          // Handle errors
          console.error("Worker error:", data.message, data.stack);
          modelStatus.value = "Error: " + data.message;
          loading.value = false;
          break;
          
        case 'complete':
          // Handle single embedding response (if needed)
          console.log('Embedding complete:', data.embedding);
          break;
      }
    };
    
    // Start the model initialization
    loading.value = true;
    modelStatus.value = "Starting initialization";
    worker.value.postMessage({ type: 'init' });
  };
  
  /**
   * Generate embeddings for all database items
   */
  const generateEmbeddings = (): void => {
    if (!worker.value) return;
    
    loading.value = true;
    modelStatus.value = "Generating embeddings";
    
    // Make sure we're sending a plain array of strings
    const plainItems = items.value.map(item => String(item));
    
    try {
      worker.value.postMessage({
        type: 'generateEmbeddings',
        data: { items: plainItems }
      });
    } catch (error) {
      console.error("Failed to send message to worker:", error);
      modelStatus.value = "Error: Failed to communicate with worker";
      loading.value = false;
    }
  };
  
  /**
   * Perform semantic search using the worker
   */
  const search = (): void => {
    if (!query.value.trim()) {
      console.warn("Empty query, not performing search");
      return;
    }
    
    if (!worker.value) {
      console.error("Worker not initialized");
      modelStatus.value = "Error: Worker not initialized";
      return;
    }
    
    if (embeddings.value.length === 0) {
      console.error("No embeddings available");
      modelStatus.value = "Error: No embeddings available";
      return;
    }
    
    console.log("Sending search request to worker", {
      query: query.value,
      embeddingsCount: embeddings.value.length,
      itemsCount: items.value.length
    });
    
    loading.value = true;
    modelStatus.value = "Searching...";
    
    try {
      // Ensure we're sending plain arrays that can be cloned
      worker.value.postMessage({
        type: 'search',
        data: {
          query: String(query.value),
          embeddings: embeddings.value.map(emb => Array.from(emb).map(Number)),
          items: items.value.map(item => String(item))
        }
      });
    } catch (error) {
      console.error("Failed to send search request to worker:", error);
      modelStatus.value = "Error: Failed to communicate with worker";
      loading.value = false;
    }
  };

  /**
   * Clean up worker
   */
  const cleanup = () => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  };

  return {
    // State
    items,
    embeddings,
    query,
    searchResults,
    loading,
    modelStatus,
    loadingProgress,
    
    // Methods
    initWorker,
    generateEmbeddings,
    search,
    cleanup
  };
}

// Initialize with default items
const {
  items,
  query,
  searchResults,
  loading,
  modelStatus,
  loadingProgress,
  initWorker,
  search,
  cleanup
} = useSemanticSearch([
  "Bed", "Car", "Train", "Cat", "Dog", "Apple", 
  "Boat", "Mouse", "Chair", "Table", "Laptop", "Bird"
]);

/**
 * Get CSS class for similarity score display
 */
const getSimilarityClass = (similarity: number): string => {
  if (similarity > 0.8) return 'text-accent font-medium';
  if (similarity > 0.5) return 'text-accent-muted';
  if (similarity > 0.3) return 'text-color-base';
  return 'text-color-base-muted';
};

// Initialize worker when component is mounted
onMounted(() => {
  initWorker();
});

// Clean up worker when component is unmounted
onBeforeUnmount(() => {
  cleanup();
});
</script>

<style>
:root {
  --color-fill: rgb(33, 39, 55);
  --color-text-base: rgb(234, 237, 243);
  --color-accent: rgb(255, 107, 237);
  --color-card: rgb(52, 63, 96);
  --color-card-muted: rgb(138, 51, 123);
  --color-border: rgb(171, 75, 153);
  
  /* Additional derived colors */
  --color-accent-hover: rgb(223, 70, 204);
  --color-text-base-muted: rgba(234, 237, 243, 0.7);
}

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