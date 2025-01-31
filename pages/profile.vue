// pages/profile.vue
<template>
  <div class="max-w-lg mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
          <!-- Profile Image Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <div class="mt-1">
              <div class="flex items-center space-x-4">
                <!-- Image Preview -->
                <div class="relative w-24 h-24">
                  <img
                    v-if="formData.avatar_url"
                    :src="formData.avatar_url"
                    alt="Profile"
                    class="w-full h-full object-cover rounded-full"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    <span class="text-gray-500 text-xl">
                      {{ formData.username?.[0]?.toUpperCase() }}
                    </span>
                  </div>
                </div>

                <!-- Upload Controls -->
                <div class="flex flex-col space-y-2">
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept="image/*"
                    @change="handleFileSelect"
                  />
                  <BaseButton
                    type="button"
                    @click="$refs.fileInput.click()"
                    :disabled="isLoading"
                    variant="secondary"
                    :text="formData.avatar_url ? 'Change Image' : 'Upload Image'"
                  />
                  <BaseButton
                    v-if="formData.avatar_url"
                    type="button"
                    @click="handleRemoveImage"
                    :disabled="isLoading"
                    variant="danger"
                    text="Remove Image"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Username Input -->
          <BaseInput
            v-model="formData.username"
            id="username"
            label="Username"
            required
            :error="errors.username"
            helper-text="This will be your display name in the band dashboard."
          />

          <!-- Band Role Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Band Role
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.band_role"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select your role</option>
              <option value="Vocals">Vocals</option>
              <option value="Guitar">Guitar</option>
              <option value="Bass">Bass</option>
              <option value="Drums">Drums</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            :is-loading="isLoading"
            :text="isLoading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')"
            class="w-auto"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProfileStore } from '~/stores/profile';
import type { Database } from '~/types/supabase';
import { useLoadingState } from '~/composables/useLoadingState';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import { useImageUpload } from '~/composables/useImageUpload';
import { BaseButton, BaseInput } from '~/components/ui';

interface FormData {
  username: string;
  band_role: string;
  role: Database['public']['Tables']['band_members']['Row']['role'];
  avatar_url: string | null;
  spotify_playlist: string | null;
  youtube_playlist: string | null;
  background_color: string | null;
}

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { validateForm, errors } = useFormValidation();
const { checkAuthAndRedirect } = useSupabaseAuth();
const { uploadImage, removeImage } = useImageUpload();

const router = useRouter();
const store = useProfileStore();
const { profile } = storeToRefs(store);
const fileInput = ref<HTMLInputElement | null>(null);

// Form data and validation
const formData = ref<FormData>({
  username: '',
  band_role: '',
  role: profile.value?.role || 'member',
  avatar_url: null,
  spotify_playlist: null,
  youtube_playlist: null,
  background_color: null
});

const validationRules = {
  username: [
    { validate: (v: string) => !!v.trim(), message: 'Username is required' },
    { validate: (v: string) => v.length >= 3, message: 'Username must be at least 3 characters' }
  ],
  band_role: [
    { validate: (v: string) => !!v.trim(), message: 'Band role is required' }
  ]
};

// Check if this is a new user (no profile yet)
const isNewUser = computed(() => !profile.value);

// Methods
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const file = input.files[0];
    const publicUrl = await uploadImage(
      file,
      'profile-images',
      `profile/${Date.now()}`
    );
    formData.value.avatar_url = publicUrl;
  } catch (e: any) {
    error.value = e.message;
  } finally {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

async function handleRemoveImage() {
  if (!formData.value.avatar_url) return;

  try {
    const filePath = formData.value.avatar_url.split('/').slice(-2).join('/');
    await removeImage('profile-images', filePath);
    formData.value.avatar_url = null;
  } catch (e: any) {
    error.value = e.message;
  }
}

const handleBack = () => {
  router.back();
};

const handleSubmit = async () => {
  if (!validateForm(formData.value, validationRules)) {
    return;
  }

  try {
    await withLoading(async () => {
      await store.upsertProfile(formData.value);
      
      // If this is a new user, redirect to home
      // Otherwise, go back to the previous page
      if (isNewUser.value) {
        navigateTo('/');
      } else {
        router.back();
      }
    });
  } catch (e: any) {
    error.value = e.message;
  }
};

// Initialize form data when profile is loaded
onMounted(async () => {
  if (checkAuthAndRedirect()) {
    await withLoading(async () => {
      await store.fetchProfile();
      if (profile.value) {
  formData.value = {
    username: profile.value.username,
    band_role: profile.value.band_role || '',
    role: profile.value.role,
    avatar_url: profile.value.avatar_url,
    spotify_playlist: profile.value.spotify_playlist,
    youtube_playlist: profile.value.youtube_playlist,
    background_color: profile.value.background_color
  };
      }
    });
  }
});
</script>