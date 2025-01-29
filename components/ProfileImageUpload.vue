// components/ProfileImageUpload.vue
<template>
  <div class="space-y-4">
    <!-- Current Profile Image Display -->
    <div class="flex items-center space-x-4">
      <div class="relative w-24 h-24">
        <img
          v-if="currentImageUrl"
          :src="currentImageUrl"
          alt="Profile"
          class="w-full h-full object-cover rounded-full"
        />
        <div 
          v-else
          class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"
        >
          <span class="text-gray-500 text-xl">{{ initials }}</span>
        </div>
        
        <div 
          v-if="isLoading"
          class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
      
      <div class="flex-1">
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="image/*"
          @change="handleFileSelect"
        />

        <div class="flex flex-col space-y-2">
          <BaseButton
            type="button"
            @click="$refs.fileInput.click()"
            :disabled="isLoading"
            :text="currentImageUrl ? 'Change Image' : 'Select Image'"
          />

          <BaseButton
            v-if="currentImageUrl"
            type="button"
            @click="handleRemoveImage"
            :disabled="isLoading"
            variant="secondary"
            text="Remove Image"
          />
        </div>
      </div>
    </div>
    
    <!-- Selected File Name -->
    <div v-if="selectedFileName" class="text-sm text-gray-600">
      Selected file: {{ selectedFileName }}
    </div>
    
    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useImageUpload } from '~/composables/useImageUpload';
import { useLoadingState } from '~/composables/useLoadingState';

const props = defineProps<{
  currentImageUrl: string | null;
  username: string;
}>();

const emit = defineEmits<{
  (e: 'update:image', url: string | null): void;
}>();

const { uploadImage, removeImage } = useImageUpload();
const { isLoading, error, withLoading } = useLoadingState();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFileName = ref<string | null>(null);

// Compute initials for avatar placeholder
const initials = computed(() => {
  return props.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Utility function to extract file path from URL
const extractFilePathFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  return `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
};

// Handle file selection and upload
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  selectedFileName.value = file.name;

  try {
    const publicUrl = await uploadImage(
      file,
      'profile-images',
      `profile/${Date.now()}`
    );
    emit('update:image', publicUrl);
    selectedFileName.value = null;
    if (fileInput.value) fileInput.value.value = '';
  } catch (e: any) {
    if (fileInput.value) fileInput.value.value = '';
  }
}

// Handle image removal
async function handleRemoveImage() {
  if (!props.currentImageUrl) return;

  try {
    const filePath = extractFilePathFromUrl(props.currentImageUrl);
    await removeImage('profile-images', filePath);
    emit('update:image', null);
  } catch (e: any) {
    console.error('Error removing image:', e);
  }
}

// Clean up on component unmount
onBeforeUnmount(() => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>