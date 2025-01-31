<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Sign in to your account' : 'Create new account' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <button
            @click="toggleMode"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </button>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
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
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up') }}
          </button>
        </div>
      </form>

      <div v-if="error" class="mt-4 text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">
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

const isLogin = ref(true);
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

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
  errors.value = {};
};

const handleSubmit = async () => {
  if (!validateForm(formData.value, validationRules)) {
    return;
  }

  try {
    await withLoading(async () => {
      if (isLogin.value) {
        // Handle login
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: formData.value.email,
          password: formData.value.password,
        });

        if (authError) throw authError;
      } else {
        // Handle signup
        const { error: authError } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (authError) throw authError;

        error.value = 'Please check your email to confirm your registration.';
        return;
      }

      router.push('/');
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
};
</script>