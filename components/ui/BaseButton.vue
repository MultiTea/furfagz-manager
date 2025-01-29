// components/ui/BaseButton.vue
<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="[
      'inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'primary' ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' :
      variant === 'secondary' ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500' :
      variant === 'danger' ? 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' : '',
      disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '',
      className
    ]"
    v-bind="$attrs"
  >
    <slot name="icon-left" />
    <span :class="{ 'ml-2': $slots['icon-left'] }">
      <slot>{{ text }}</slot>
    </span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'danger'

withDefaults(defineProps<{
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  disabled?: boolean
  isLoading?: boolean
  text?: string
  className?: string
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  isLoading: false,
  text: '',
  className: ''
})
</script>