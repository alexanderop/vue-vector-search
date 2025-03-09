<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  query: string
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'search'): void
}>()

const queryValue = ref(props.query)

watch(() => props.query, (newValue) => {
  queryValue.value = newValue
})

watch(queryValue, (newValue) => {
  emit('update:query', newValue)
})

function search() {
  emit('search')
}
</script>

<template>
  <div class="flex mb-5">
    <input
      v-model="queryValue"
      placeholder="Enter your search query..."
      class="flex-1 p-3 border border-border rounded text-color-base bg-card text-color-base"
      @keyup.enter="search"
    >
    <button
      class="ml-3 px-5 py-3 bg-accent hover:bg-accent-hover text-color-base font-medium rounded"
      @click="search"
    >
      Search
    </button>
  </div>
</template>
