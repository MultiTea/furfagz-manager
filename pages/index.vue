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
              
              <!-- Setlists Card -->
              <div class="bg-purple-50 p-6 rounded-lg">
                <template v-if="bandMember?.role === 'admin'">
                  <h2 class="text-lg font-medium text-purple-700">Manage Setlists</h2>
                  <p class="text-purple-600 mt-2">Create and manage performance setlists.</p>
                  <NuxtLink 
                    to="/admin/setlists" 
                    class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Manage Setlists
                  </NuxtLink>
                </template>
                <template v-else>
                  <h2 class="text-lg font-medium text-purple-700">View Setlists</h2>
                  <p class="text-purple-600 mt-2">Check out the upcoming performance setlists.</p>
                  <NuxtLink 
                    to="/setlists" 
                    class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    View Setlists
                  </NuxtLink>
                </template>
              </div>
            </div>
  
            <!-- Quick Stats Section remains the same -->
          </div>
  
          <!-- Login prompt section remains the same -->
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import type { Database } from '~/types/supabase';
  
  // Authentication and user info
  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();
  const bandMember = ref<Database['public']['Tables']['band_members']['Row'] | null>(null);
  
  // Statistics
  const suggestionCount = ref(0);
  const selectedCount = ref(0);
  const setlistCount = ref(0);
  
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
  
  // Load quick stats when component mounts
  onMounted(async () => {
    if (!user.value) return;
  
    // Fetch count of user's suggestions
    const { count: suggestionsCount } = await supabase
      .from('playlist_songs')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', user.value.id);
    
    suggestionCount.value = suggestionsCount || 0;
  
    // Fetch count of user's songs selected for setlists
    const { count: selectedSongsCount } = await supabase
      .from('setlist_songs')
      .select('playlist_songs!inner(*)', { count: 'exact', head: true })
      .eq('playlist_songs.member_id', user.value.id);
    
    selectedCount.value = selectedSongsCount || 0;
  
    // Fetch count of active setlists
    const { count: activeSetlistsCount } = await supabase
      .from('setlists')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'final');
    
    setlistCount.value = activeSetlistsCount || 0;
  });
  </script>