<!-- pages/profile.vue -->
<template>
    <div class="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ profile ? 'Edit Profile' : 'Complete Your Profile' }}
            </h1>
            <button
              v-if="!isNewUser"
              @click="handleBack"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          </div>
  
          <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
            {{ error }}
          </div>
  
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Profile Image
              </label>
              <div class="mt-1">
                <ProfileImageUpload
                  :current-image-url="formData.avatar_url"
                  :username="formData.username"
                  @update:image="handleImageUpdate"
                />
              </div>
            </div>
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p class="mt-1 text-sm text-gray-500">
                This will be your display name in the band dashboard.
              </p>
            </div>
  
            <div>
              <label for="full_name" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="full_name"
                v-model="formData.full_name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
  
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ isLoading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useProfileStore } from '~/stores/profile';
  import type { Database } from '~/types/supabase';
  import ProfileImageUpload from '~/components/ProfileImageUpload.vue';
  
  interface FormData {
    username: string;
    full_name: string;
    role: Database['public']['Tables']['band_members']['Row']['role'];
    avatar_url: string | null;
  }
  
  const store = useProfileStore();
  const { profile, isLoading, error } = storeToRefs(store);
  const router = useRouter();
  
  // Check if this is a new user (no profile yet)
  const isNewUser = computed(() => !profile.value);
  
  // Initialize form data with default values
  const formData = ref<FormData>({
    username: '',
    full_name: '',
    role: profile.value?.role || 'member',
    avatar_url: null
  });
  
  const handleImageUpdate = (url: string | null) => {
    formData.value.avatar_url = url;
  };
  
  // Load existing profile data if available
  onMounted(async () => {
    await store.fetchProfile();
    if (profile.value) {
      formData.value = {
        username: profile.value.username,
        full_name: profile.value.full_name || '',
        role: profile.value.role,
        avatar_url: profile.value.avatar_url
      };
    }
  });
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSubmit = async () => {
    try {
      await store.upsertProfile(formData.value);
      
      // If this is a new user, redirect to home
      // Otherwise, go back to the previous page
      if (isNewUser.value) {
        navigateTo('/');
      } else {
        router.back();
      }
    } catch (e) {
      // Error is handled by the store and displayed in the template
    }
  };
  </script>