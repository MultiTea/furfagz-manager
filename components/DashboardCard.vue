// components/DashboardCard.vue
<template>
  <div :class="['p-6 rounded-lg', colorScheme.bg]">
    <h2 :class="['text-lg font-medium', colorScheme.text]">{{ title }}</h2>
    <p :class="['mt-2', colorScheme.description]">{{ description }}</p>
    <NuxtLink 
      :to="to" 
      :class="[
        'mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white',
        colorScheme.button,
        colorScheme.hover
      ]"
    >
      {{ buttonText }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
interface ColorScheme {
  bg: string;
  text: string;
  description: string;
  button: string;
  hover: string;
}

defineProps<{
  title: string;
  description: string;
  to: string;
  colorScheme: ColorScheme;
  buttonText: string;
}>();
</script>