<!-- pages/index.vue -->
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Band Setlist Manager</h1>
        
        <div v-if="user" class="space-y-6">
          <p class="text-gray-600">
            Welcome {{ bandMember?.username || user.email }}! 
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <!-- Personal Playlist Card -->
            <div class="bg-indigo-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-indigo-700">My Playlist</h2>
              <p class="text-indigo-600 mt-2">Manage your personal song suggestions for the band.</p>
              <NuxtLink 
                to="/my-playlist" 
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View My Playlist
              </NuxtLink>
            </div>
            
            <!-- All Playlists Card -->
            <div class="bg-emerald-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-emerald-700">All Playlists</h2>
              <p class="text-emerald-600 mt-2">Explore song suggestions from all band members.</p>
              <NuxtLink 
                to="/all-playlists" 
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                View All Playlists
              </NuxtLink>
            </div>
            
            <!-- Setlist Card -->
            <div class="bg-purple-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-purple-700">
                {{ bandMember?.role === 'admin' ? 'Manage Setlist' : 'View Setlist' }}
              </h2>
              <p class="text-purple-600 mt-2">
                {{ bandMember?.role === 'admin' 
                  ? 'Create and manage the band setlist.' 
                  : 'Check out the current band setlist.' }}
              </p>
              <NuxtLink 
                to="/setlists" 
                class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                {{ bandMember?.role === 'admin' ? 'Manage Setlist' : 'View Setlist' }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="text-center">
          <p class="text-gray-600">Please log in to access the band setlist manager.</p>
          <NuxtLink
            to="/login"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Log In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { Database } from '~/types/supabase';

// Authentication and user info
const user = useSupabaseUser();
const supabase = useSupabaseClient<Database>();
const bandMember = ref<Database['public']['Tables']['band_members']['Row'] | null>(null);

// Fetch band member details when user is authenticated
watch(user, async (newUser) => {
  if (newUser) {
    const { data } = await supabase
      .from('band_members')
      .select('*')
      .eq('id', newUser.id)
      .single();
    
    bandMember.value = data;
  } else {
    bandMember.value = null;
  }
}, { immediate: true });
</script>