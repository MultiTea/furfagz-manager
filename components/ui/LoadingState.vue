// components/ui/LoadingState.vue
<template>
  <div :class="['text-center', className]">
    <div class="animate-pulse text-gray-500">
      <slot>Loading...</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>