<!-- pages/setlists.vue -->
<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Create New Setlist Section -->
      <div class="bg-white shadow sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Create New Setlist</h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Create a new setlist for your upcoming performance.</p>
          </div>
          <form @submit.prevent="handleCreateSetlist" class="mt-5 flex gap-3">
            <input
              v-model="newSetlistName"
              type="text"
              required
              placeholder="Enter setlist name"
              class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isLoading ? 'Creating...' : 'Create Setlist' }}
            </button>
          </form>
        </div>
      </div>
  
      <!-- Setlists List Section -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Your Setlists</h3>
          
          <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
            {{ error }}
          </div>
  
          <div v-if="isLoading" class="mt-4 text-gray-500">
            Loading setlists...
          </div>
  
          <div v-else-if="setlists.length === 0" class="mt-4 text-gray-500">
            No setlists created yet. Create your first one above!
          </div>
  
          <ul v-else role="list" class="mt-4 divide-y divide-gray-200">
            <li v-for="setlist in setlists" :key="setlist.id" class="py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">{{ setlist.name }}</h4>
                  <p class="mt-1 text-sm text-gray-500">
                    Created {{ new Date(setlist.created_at).toLocaleDateString() }}
                  </p>
                </div>
                <NuxtLink
                  :to="`/setlists/${setlist.id}`"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Details
                </NuxtLink>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useSetlistsStore } from '~/stores/setlists';
  
  const store = useSetlistsStore();
  const { setlists, isLoading, error } = storeToRefs(store);
  const newSetlistName = ref('');
  
  onMounted(() => {
    store.fetchSetlists();
  });
  
  const handleCreateSetlist = async () => {
    if (!newSetlistName.value.trim()) return;
  
    try {
      await store.createSetlist(newSetlistName.value);
      newSetlistName.value = ''; // Clear input after success
    } catch (e) {
      // Error is handled by the store and displayed in the template
    }
  };
  </script>