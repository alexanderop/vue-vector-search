import { pipeline } from '@huggingface/transformers'
import { cosineSimilarity } from '../utils/vectorUtils'

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task = 'feature-extraction'
  static model = 'Supabase/gte-small'
  static fallbackModel = 'Xenova/all-MiniLM-L6-v2'
  static instance = null

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        // Try the primary model first
        this.instance = await pipeline(this.task, this.model, {
          progress_callback: (progress) => {
            // Normalize progress value between 0 and 1
            if (progress.progress !== undefined) {
              progress.progress = Math.min(Math.max(progress.progress, 0), 1)
            }
            progress_callback(progress)
          },
          dtype: 'fp32',
          device: navigator.gpu ? 'webgpu' : 'wasm',
        })
      }
      catch (error) {
        // If primary model fails, try fallback model
        globalThis.postMessage({
          status: 'progress',
          message: `Primary model failed, trying fallback model: ${error.message}`,
        })

        this.instance = await pipeline(this.task, this.fallbackModel, {
          progress_callback: (progress) => {
            // Normalize progress value between 0 and 1
            if (progress.progress !== undefined) {
              progress.progress = Math.min(Math.max(progress.progress, 0), 1)
            }
            progress_callback(progress)
          },
          dtype: 'fp32',
          device: navigator.gpu ? 'webgpu' : 'wasm',
        })
      }
    }
    return this.instance
  }
}

// Listen for messages from the main thread
globalThis.addEventListener('message', async (event) => {
  try {
    const { type, data } = event.data

    switch (type) {
      case 'init': {
        // Initialize the pipeline and notify when ready
        await PipelineSingleton.getInstance((progress) => {
          globalThis.postMessage({
            status: 'progress',
            ...progress,
          })
        })
        globalThis.postMessage({ status: 'initialized' })
        break
      }

      case 'generateEmbeddings': {
        // Get pipeline instance
        const pipeline = await PipelineSingleton.getInstance((progress) => {
          globalThis.postMessage({
            status: 'progress',
            ...progress,
          })
        })

        // Generate embeddings for all items
        const embeddings = []
        for (const item of data.items) {
          const result = await pipeline(item, {
            pooling: 'mean',
            normalize: true,
          })

          // Extract embedding data
          let embedding
          if (result && result.data) {
            // Ensure we create a plain array from typed array
            embedding = Array.from(result.data)
          }
          else if (Array.isArray(result)) {
            embedding = Array.from(result)
          }
          else {
            throw new TypeError('Unexpected result format')
          }

          // Make sure we have a simple array of numbers
          embedding = embedding.map(Number)

          // Store the embedding
          embeddings.push(Array.from(embedding).map(Number))
        }

        // Make sure we're sending a simple array of arrays
        globalThis.postMessage({
          status: 'embeddingsGenerated',
          embeddings: embeddings.map(emb => Array.from(emb).map(Number)),
        })
        break
      }

      case 'search': {
        globalThis.postMessage({
          status: 'debug',
          message: 'Search request received',
          query: data.query,
        })

        // Validate inputs
        if (!data.query || !data.embeddings || !data.items) {
          throw new Error('Invalid search parameters')
        }

        // Get pipeline instance
        const searchPipeline = await PipelineSingleton.getInstance()

        // Generate embedding for query
        const queryResult = await searchPipeline(data.query, {
          pooling: 'mean',
          normalize: true,
        })

        // Extract query embedding
        let queryEmbedding
        if (queryResult && queryResult.data) {
          queryEmbedding = Array.from(queryResult.data).map(Number)
        }
        else if (Array.isArray(queryResult)) {
          queryEmbedding = Array.from(queryResult).map(Number)
        }
        else {
          throw new TypeError('Unexpected query result format')
        }

        // Calculate similarity with all items - ensure we're working with plain arrays
        const similarities = data.embeddings.map((embedding, index) => {
          // Convert to plain array if needed
          const plainEmbedding = Array.isArray(embedding) ? embedding.map(Number) : Array.from(embedding).map(Number)
          const similarity = cosineSimilarity(queryEmbedding, plainEmbedding)
          return {
            item: data.items[index],
            similarity,
          }
        })

        // Sort by similarity and get top results
        similarities.sort((a, b) => b.similarity - a.similarity)
        const topResults = similarities.slice(0, 3)

        globalThis.postMessage({
          status: 'searchResults',
          results: topResults,
        })
        break
      }

      case 'embedding': {
        // Simple single embedding generation (matching the example pattern)
        const singlePipeline = await PipelineSingleton.getInstance((progress) => {
          globalThis.postMessage({
            status: 'progress',
            ...progress,
          })
        })

        const output = await singlePipeline(data.text, {
          pooling: 'mean',
          normalize: true,
        })

        // Extract the embedding output
        const embedding = Array.from(output.data)

        globalThis.postMessage({
          status: 'complete',
          embedding,
        })
        break
      }

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  }
  catch (error) {
    console.error('Worker error:', error)
    globalThis.postMessage({
      status: 'error',
      message: error.message,
      stack: error.stack,
    })
  }
})
