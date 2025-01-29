// pages/profile.vue
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

          <BaseInput
            v-model="formData.username"
            id="username"
            label="Username"
            required
            :error="errors.username"
            helper-text="This will be your display name in the band dashboard."
          />

          <BaseInput
            v-model="formData.full_name"
            id="full_name"
            label="Full Name"
            required
            :error="errors.full_name"
          />

          <div>
            <BaseButton
              type="submit"
              :is-loading="isLoading"
              :text="isLoading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')"
              class="w-full"
            />
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
import { useLoadingState } from '~/composables/useLoadingState';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import ProfileImageUpload from '~/components/ProfileImageUpload.vue';
import { BaseButton, BaseInput } from '~/components/ui';

interface FormData {
  username: string;
  full_name: string;
  role: Database['public']['Tables']['band_members']['Row']['role'];
  avatar_url: string | null;
}

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { validateForm, errors } = useFormValidation();
const { checkAuthAndRedirect } = useSupabaseAuth();

const router = useRouter();
const store = useProfileStore();
const { profile } = storeToRefs(store);

// Form data and validation
const formData = ref<FormData>({
  username: '',
  full_name: '',
  role: profile.value?.role || 'member',
  avatar_url: null
});

const validationRules = {
  username: [
    { validate: (v: string) => !!v.trim(), message: 'Username is required' },
    { validate: (v: string) => v.length >= 3, message: 'Username must be at least 3 characters' }
  ],
  full_name: [
    { validate: (v: string) => !!v.trim(), message: 'Full name is required' }
  ]
};

// Check if this is a new user (no profile yet)
const isNewUser = computed(() => !profile.value);

// Methods
const handleImageUpdate = (url: string | null) => {
  formData.value.avatar_url = url;
};

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
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
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
          full_name: profile.value.full_name || '',
          role: profile.value.role,
          avatar_url: profile.value.avatar_url
        };
      }
    });
  }
});
</script>