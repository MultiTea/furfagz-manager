// components/ui/BaseInput.vue
<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="mt-1">
      <input
        :id="id"
        :value="modelValue ?? ''"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value || null)"
        :type="type"
        :required="required"
        :placeholder="placeholder"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        v-bind="$attrs"
      />
    </div>
    <p v-if="helperText" class="mt-1 text-sm text-gray-500">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | null
  label?: string
  id: string
  type?: string
  required?: boolean
  placeholder?: string
  helperText?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()
</script>