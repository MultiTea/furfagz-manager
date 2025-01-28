<!-- pages/setlists.vue -->
<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Current Setlist</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ isAdmin ? 'Drag and drop songs to reorder them.' : 'View the current setlist order.' }}
          </p>
  
          <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
            {{ error }}
          </div>
  
          <div v-if="isLoading" class="mt-4 text-gray-500">
            Loading setlist...
          </div>
  
          <div v-else-if="setlistSongs.length === 0" class="mt-4 text-gray-500">
            No songs have been added to the setlist yet.
            {{ isAdmin ? 'Add songs from the All Playlists page.' : '' }}
          </div>
  
          <draggable
            v-else
            v-model="setlistSongs"
            class="mt-6 space-y-2"
            :disabled="!isAdmin"
            item-key="id"
            handle=".handle"
            @end="handleReorder"
          >
            <template #item="{ element: song }">
              <div 
                class="bg-white border rounded-lg p-4 flex items-center space-x-4"
                :class="{ 'cursor-move': isAdmin }"
              >
                <!-- Drag Handle (only visible to admin) -->
                <div v-if="isAdmin" class="handle cursor-move text-gray-400">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>
  
                <!-- Song Number -->
                <div class="flex-none w-8 text-gray-500 font-medium">
                  {{ setlistSongs.indexOf(song) + 1 }}.
                </div>
  
                <!-- Song Info -->
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
                  <p class="text-sm text-gray-500">{{ song.artist }}</p>
                  <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Duration: {{ formatDuration(song.duration) }}</span>
                    <span>Added by: {{ getMemberName(song.member_id) }}</span>
                  </div>
                </div>
  
                <!-- Actions -->
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
                  <button
                    v-if="isAdmin"
                    @click="removeFromSetlist(song)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </template>
          </draggable>
  
          <!-- Total Duration -->
          <div v-if="setlistSongs.length > 0" class="mt-6 text-sm text-gray-500">
            Total Duration: {{ formatDuration(totalDuration) }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { usePlaylistStore } from '~/stores/playlist';
  import { useMembersStore } from '~/stores/members';
  import { VueDraggableNext as draggable } from 'vue-draggable-next';
  import type { Database } from '~/types/supabase';
  
  type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];
  
  const playlistStore = usePlaylistStore();
  const membersStore = useMembersStore();
  const { setlistSongs, isLoading, error } = storeToRefs(playlistStore);
  const { members } = storeToRefs(membersStore);
  
  // Get current user role
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const isAdmin = ref(false);
  
  // Check if current user is admin and load data
  onMounted(async () => {
    if (user.value) {
      const { data } = await supabase
        .from('band_members')
        .select('role')
        .eq('id', user.value.id)
        .single();
      
      isAdmin.value = data?.role === 'admin';
    }
    
    await Promise.all([
      playlistStore.fetchSetlistSongs(),
      membersStore.fetchMembersWithPlaylists()
    ]);
  });
  
  // Format duration from PostgreSQL interval to readable format
  function formatDuration(duration: string) {
    const [minutes, seconds] = duration.split(':');
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
  
  // Calculate total duration
  const totalDuration = computed(() => {
    let totalMinutes = 0;
    let totalSeconds = 0;
  
    setlistSongs.value.forEach(song => {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      totalMinutes += minutes;
      totalSeconds += seconds;
    });
  
    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;
  
    return `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
  });
  
  // Get member name by ID
  function getMemberName(memberId: string) {
    const member = members.value.find(m => m.id === memberId);
    return member?.username || 'Unknown Member';
  }
  
  // Handle reordering
  async function handleReorder() {
    if (!isAdmin.value) return;
    
    try {
      await playlistStore.updateSetlistOrder(setlistSongs.value);
    } catch (e) {
      console.error('Error updating setlist order:', e);
    }
  }
  
  // Remove song from setlist
  async function removeFromSetlist(song: PlaylistSong) {
    if (!isAdmin.value) return;
    
    try {
      await playlistStore.toggleSongInSetlist(song.id, false);
      await playlistStore.fetchSetlistSongs();
    } catch (e) {
      console.error('Error removing song from setlist:', e);
    }
  }
  
  // Show song notes in a dialog
  function showNotes(song: PlaylistSong) {
    alert(song.notes);
  }
  </script>