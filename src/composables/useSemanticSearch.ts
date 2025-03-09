import { onBeforeUnmount, onMounted, ref } from 'vue'

type Embedding = number[]
interface SearchResult { item: string, similarity: number }

export function useSemanticSearch(initialItems: string[]) {
  const items = ref<string[]>(initialItems)
  const embeddings = ref<Embedding[]>([])
  const worker = ref<Worker | null>(null)

  // Search state
  const query = ref<string>('')
  const searchResults = ref<SearchResult[]>([])

  // UI state
  const loading = ref<boolean>(false)
  const modelStatus = ref<string>('Not started')
  const loadingProgress = ref<number>(0)

  const generateEmbeddings = (): void => {
    if (!worker.value)
      return

    loading.value = true
    modelStatus.value = 'Generating embeddings'

    // Make sure we're sending a plain array of strings
    const plainItems = items.value.map(item => String(item))

    try {
      worker.value.postMessage({
        type: 'generateEmbeddings',
        data: { items: plainItems },
      })
    }
    catch {
      modelStatus.value = 'Error: Failed to communicate with worker'
      loading.value = false
    }
  }

  const initWorker = (): void => {
    // Create the web worker
    worker.value = new Worker(new URL('../workers/embeddingWorker.js', import.meta.url), { type: 'module' })

    // Set up message handler
    worker.value.onmessage = (e) => {
      const { status, ...data } = e.data

      switch (status) {
        case 'debug':
          break

        case 'progress':
          // Update progress information with proper clamping
          if (data.progress !== undefined) {
            // Ensure progress is always between 0-100%
            loadingProgress.value = Math.min(Math.round(data.progress * 100), 100)
            modelStatus.value = `${data.status}: ${loadingProgress.value}%`
          }
          else if (data.message) {
            modelStatus.value = data.message
          }
          else {
            modelStatus.value = data.status || 'Processing...'
          }
          break

        case 'initialized':
          // Model has been initialized, generate embeddings for items
          generateEmbeddings()
          break

        case 'embeddingsGenerated':
          // Embeddings have been generated
          embeddings.value = data.embeddings
          modelStatus.value = 'Ready'
          loading.value = false
          break

        case 'searchResults':
          // Search results are ready
          searchResults.value = data.results
          loading.value = false
          break

        case 'error':
          // Handle errors
          modelStatus.value = `Error: ${data.message}`
          loading.value = false
          break

        case 'complete':
          // Handle single embedding response (if needed)
          break
      }
    }

    // Start the model initialization
    loading.value = true
    modelStatus.value = 'Starting initialization'
    worker.value.postMessage({ type: 'init' })
  }

  const search = (): void => {
    if (!query.value.trim()) {
      return
    }

    if (!worker.value) {
      modelStatus.value = 'Error: Worker not initialized'
      return
    }

    if (embeddings.value.length === 0) {
      modelStatus.value = 'Error: No embeddings available'
      return
    }

    loading.value = true
    modelStatus.value = 'Searching...'

    try {
      // Ensure we're sending plain arrays that can be cloned
      worker.value.postMessage({
        type: 'search',
        data: {
          query: String(query.value),
          embeddings: embeddings.value.map(emb => Array.from(emb).map(Number)),
          items: items.value.map(item => String(item)),
        },
      })
    }
    catch (e: any) {
      modelStatus.value = 'Error: Failed to communicate with worker'
      loading.value = false
    }
  }

  const cleanup = () => {
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
    }
  }

  onMounted(() => {
    initWorker()
  })

  onBeforeUnmount(() => {
    cleanup()
  })

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
    search,
  }
}
