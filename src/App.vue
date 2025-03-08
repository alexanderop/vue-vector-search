<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 p-5 font-sans dark:bg-slate-900 dark:text-slate-100">
    <SemanticSearch />
  </div>
</template>

<script>
import SemanticSearch from './components/SemanticSearch.vue'

export default {
  name: 'App',
  components: {
    SemanticSearch
  }
}
</script>

<style>
/* Global color variables for consistent contrast */
:root {
  --primary: #1e40af;
  --primary-hover: #1e3a8a;
  --secondary: #0f766e;
  --secondary-hover: #0e7490;
  --accent: #9333ea;
  --danger: #dc2626;
  --success: #16a34a;
  --warning: #ca8a04;
  --background-light: #f8fafc;
  --background-dark: #0f172a;
  --text-light: #0f172a;
  --text-dark: #f8fafc;
}

/* Apply some global styles for better contrast */
body {
  color: var(--text-light);
  background-color: var(--background-light);
}

@media (prefers-color-scheme: dark) {
  body {
    color: var(--text-dark);
    background-color: var(--background-dark);
  }
}

/* Accessibility classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style> 