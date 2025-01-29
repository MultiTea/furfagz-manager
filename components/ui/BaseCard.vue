// components/ui/BaseCard.vue
<template>
  <div class="bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-medium leading-6 text-gray-900">
          {{ title }}
        </h3>
        <p v-if="description" class="mt-1 text-sm text-gray-500">
          {{ description }}
        </p>
      </slot>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>