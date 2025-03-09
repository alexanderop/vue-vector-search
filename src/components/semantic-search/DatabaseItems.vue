<script setup lang="ts">
defineProps<{
  items: string[]
}>()
</script>

<template>
  <div class="mb-6">
    <div class="p-3 font-semibold rounded-t-md border border-border bg-card">
      Items in database:
    </div>
    <div class="flex flex-wrap gap-2 p-3 border border-border border-t-0 rounded-b-md bg-card-muted">
      <span
        v-for="(item, idx) in items" :key="idx"
        class="px-3 py-1 rounded-full text-sm bg-fill text-color-base border border-border"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>
