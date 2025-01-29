// components/ui/EmptyState.vue
<template>
  <div class="text-center py-6">
    <div class="text-gray-500">
      <slot>{{ message }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>