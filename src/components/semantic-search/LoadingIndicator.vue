<script setup lang="ts">
defineProps<{
  loading: boolean
  modelStatus: string
  loadingProgress: number
}>()
</script>

<template>
  <div v-if="loading" class="my-5 p-4 rounded-md border border-border bg-card">
    <div class="text-center italic text-color-base">
      <div class="mb-2 font-medium">
        Loading model and computing embeddings...
      </div>
      <div class="text-sm">
        Status: {{ modelStatus }}
      </div>
    </div>

    <div v-if="modelStatus.includes('Downloading')" class="mt-3">
      <div class="text-xs text-color-base-muted mb-1">
        This might take a moment on first load as the model is downloaded (~40MB)
      </div>
      <div class="w-full bg-fill rounded-full h-2">
        <div class="bg-accent h-2 rounded-full" :style="{ width: `${loadingProgress}%` }" />
      </div>
    </div>
  </div>
</template>
