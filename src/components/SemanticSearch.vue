<script setup lang="ts">
import { useSemanticSearch } from '../composables/useSemanticSearch'
import DatabaseItems from './semantic-search/DatabaseItems.vue'
import LoadingIndicator from './semantic-search/LoadingIndicator.vue'
import SearchInput from './semantic-search/SearchInput.vue'
import SearchResults from './semantic-search/SearchResults.vue'

interface SemanticSearchData {
  items: string[]
  query: string
  searchResults: any[] // Replace 'any' with the actual type if available
  loading: boolean
  modelStatus: string
  loadingProgress: number
  search: () => void
}

const {
  items,
  query,
  searchResults,
  loading,
  modelStatus,
  loadingProgress,
  search,
}: SemanticSearchData = useSemanticSearch([
  'Bed',
  'Car',
  'Train',
  'Cat',
  'Dog',
  'Apple',
  'Boat',
  'Mouse',
  'Chair',
  'Table',
  'Laptop',
  'Bird',
])
</script>

<template>
  <div class="container mx-auto max-w-3xl p-6 rounded-lg shadow-md bg-fill">
    <h1 class="text-3xl font-bold text-center text-color-base mb-6">
      Semantic Search
    </h1>
    <DatabaseItems :items="items" />
    <SearchInput
      v-model:query="query"
      @search="search"
    />
    <LoadingIndicator
      :loading="loading"
      :model-status="modelStatus"
      :loading-progress="loadingProgress"
    />
    <SearchResults :search-results="searchResults" />
  </div>
</template>
