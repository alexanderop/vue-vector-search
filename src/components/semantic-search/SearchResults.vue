<script setup lang="ts">
interface SearchResult {
  item: string
  similarity: number
}

defineProps<{
  searchResults: SearchResult[]
}>()

function getSimilarityClass(similarity: number): string {
  if (similarity > 0.8)
    return 'text-accent font-medium'
  if (similarity > 0.5)
    return 'text-accent-muted'
  if (similarity > 0.3)
    return 'text-color-base'
  return 'text-color-base-muted'
}
</script>

<template>
  <div v-if="searchResults.length > 0" class="mt-5 mb-6">
    <div class="p-3 font-semibold rounded-t-md border border-border bg-card">
      Top 3 Results:
    </div>
    <div class="border border-border border-t-0 rounded-b-md bg-card-muted">
      <div
        v-for="(result, idx) in searchResults" :key="idx"
        class="p-3 border-b border-border last:border-b-0 flex justify-between items-center"
      >
        <span class="font-medium text-color-base">{{ result.item }}</span>
        <div>
          <span class="text-sm text-color-base" :class="[getSimilarityClass(result.similarity)]">
            {{ (result.similarity * 100).toFixed(1) }}% similar
          </span>
          <div class="w-24 h-2 bg-fill rounded-full">
            <div
              class="h-2 rounded-full bg-accent"
              :style="{ width: `${result.similarity * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
