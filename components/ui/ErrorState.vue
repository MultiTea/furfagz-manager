// components/ui/ErrorState.vue
<template>
  <div class="p-4 bg-red-50 border border-red-400 rounded text-red-700">
    <slot>{{ message }}</slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>