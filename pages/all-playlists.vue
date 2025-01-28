<!-- pages/all-playlists.vue -->
<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 sm:px-0">
        <h2 class="text-2xl font-semibold text-gray-900">Band Members' Playlists</h2>
        <p class="mt-1 text-sm text-gray-600">
          Review all song suggestions from band members. Each playlist shows songs that members would like to perform.
        </p>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="mt-6 text-center">
        <div class="animate-pulse text-gray-500">Loading playlists...</div>
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="mt-6 bg-red-50 p-4 rounded-md">
        <div class="text-red-700">{{ error }}</div>
      </div>
  
      <!-- Content -->
      <div v-else class="mt-6 space-y-8">
        <!-- Member Playlist Cards -->
        <div v-for="member in members" :key="member.id" class="bg-white shadow sm:rounded-lg overflow-hidden">
          <!-- Member Header -->
          <div class="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              {{ member.username }}'s Playlist
              <span class="ml-2 text-sm text-gray-500">({{ member.playlist_songs.length }} songs)</span>
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ member.role === 'admin' ? 'Administrator' : 'Band Member' }}
            </p>
          </div>
  
          <!-- Playlist Content -->
          <div class="px-4 py-5 sm:p-6">
            <div v-if="member.playlist_songs.length === 0" class="text-gray-500 text-sm">
              No songs added yet.
            </div>
            
            <div v-else class="flow-root">
              <ul role="list" class="-my-5 divide-y divide-gray-200">
                <li v-for="song in member.playlist_songs" :key="song.id" class="py-4">
                  <div class="flex items-center space-x-4">
                    <!-- Setlist Checkbox -->
                    <div class="flex items-center h-5">
                      <input
                        type="checkbox"
                        :id="'setlist-' + song.id"
                        :checked="song.is_in_setlist"
                        :disabled="!isAdmin"
                        @change="handleSetlistToggle(song)"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                      >
                    </div>
  
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ song.title }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ song.artist }}
                      </p>
                      <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Duration: {{ formatDuration(song.duration) }}</span>
                        <span v-if="song.notes" class="flex items-center">
                          <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Has notes
                        </span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <a 
                        v-if="song.link"
                        :href="song.link"
                        target="_blank"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Reference
                      </a>
                      <button
                        v-if="song.notes"
                        @click="showNotes(song)"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        View Notes
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { useMembersStore } from '~/stores/members';
  import { usePlaylistStore } from '~/stores/playlist';
  import type { Database } from '~/types/supabase';
  
  const membersStore = useMembersStore();
  const playlistStore = usePlaylistStore();
  const { members, isLoading, error } = storeToRefs(membersStore);
  
  // Get current user role
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const isAdmin = ref(false);
  
  // Check if current user is admin
  onMounted(async () => {
    if (user.value) {
      const { data } = await supabase
        .from('band_members')
        .select('role')
        .eq('id', user.value.id)
        .single();
      
      isAdmin.value = data?.role === 'admin';
    }
    
    membersStore.fetchMembersWithPlaylists();
  });
  
  // Format duration from PostgreSQL interval to readable format
  function formatDuration(duration: string) {
    const [minutes, seconds] = duration.split(':');
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
  
  // Handle setlist toggle
  async function handleSetlistToggle(song: Database['public']['Tables']['playlist_songs']['Row']) {
    if (!isAdmin.value) return;
    
    try {
      await playlistStore.toggleSongInSetlist(song.id, !song.is_in_setlist);
      // Refresh the members list to update the UI
      await membersStore.fetchMembersWithPlaylists();
    } catch (e) {
      console.error('Error toggling setlist status:', e);
    }
  }
  
  // Show song notes in a dialog
  function showNotes(song: any) {
    // We could implement this with a modal component
    alert(song.notes);
  }
  </script>