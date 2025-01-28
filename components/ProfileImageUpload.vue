<!-- components/ProfileImageUpload.vue -->
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
            <span class="text-gray-500 text-xl">
              {{ initials }}
            </span>
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
            <!-- Select File Button -->
            <button
              type="button"
              @click="$refs.fileInput.click()"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ currentImageUrl ? 'Change Image' : 'Select Image' }}
            </button>
  
            <!-- Remove Image Button -->
            <button
              v-if="currentImageUrl"
              type="button"
              @click="handleRemoveImage"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Remove Image
            </button>
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
  import type { Database } from '~/types/supabase';
  
  const props = defineProps<{
    currentImageUrl: string | null;
    username: string;
  }>();
  
  const emit = defineEmits<{
    (e: 'update:image', url: string | null): void;
  }>();
  
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  
  const fileInput = ref<HTMLInputElement | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
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
  
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
  
    const file = input.files[0];
    selectedFileName.value = file.name;
    isLoading.value = true;
    error.value = null;
  
    try {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file must be an image');
      }
  
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.value?.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          upsert: true
        });
  
      if (uploadError) throw uploadError;
  
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
  
      // Emit the new URL
      emit('update:image', publicUrl);
      selectedFileName.value = null; // Clear the selected file name after successful upload
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
      if (fileInput.value) fileInput.value.value = ''; // Reset the file input
    }
  }
  
  async function handleRemoveImage() {
    if (!props.currentImageUrl) return;
  
    isLoading.value = true;
    error.value = null;
  
    try {
      // Extract file path from URL
      const urlParts = props.currentImageUrl.split('/');
      const filePath = urlParts[urlParts.length - 2] + '/' + urlParts[urlParts.length - 1];
  
      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([filePath]);
  
      if (deleteError) throw deleteError;
  
      emit('update:image', null);
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }
  </script>