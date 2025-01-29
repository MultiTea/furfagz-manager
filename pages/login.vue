// pages/login.vue
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :disabled="isLoading"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            <span v-if="errors.email" class="text-sm text-red-600">{{ errors.email }}</span>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              :disabled="isLoading"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
            <span v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</span>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>

      <div v-if="error" class="mt-4 text-red-600 text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoadingState } from '~/composables/useLoadingState';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';

const router = useRouter();
const { supabase } = useSupabaseAuth();
const { isLoading, error, withLoading } = useLoadingState();
const { validateForm, errors } = useFormValidation();

const formData = ref({
  email: '',
  password: ''
});

// Validation rules
const validationRules = {
  email: [
    { validate: (v: string) => !!v.trim(), message: 'Email is required' },
    { validate: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Invalid email format' }
  ],
  password: [
    { validate: (v: string) => !!v.trim(), message: 'Password is required' },
    { validate: (v: string) => v.length >= 6, message: 'Password must be at least 6 characters' }
  ]
};

const handleLogin = async () => {
  if (!validateForm(formData.value, validationRules)) {
    return;
  }

  try {
    await withLoading(async () => {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.value.email,
        password: formData.value.password,
      });

      if (authError) throw authError;

      router.push('/');
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
};
</script>