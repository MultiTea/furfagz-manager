<!-- pages/my-playlist.vue -->
<template>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">My Song Suggestions</h3>
          <p class="mt-1 text-sm text-gray-600">
            Add songs you'd like to perform. The admin will review these when creating setlists.
          </p>
  
          <SongForm @added="handleSongAdded" />
  
          <div v-if="isLoading" class="mt-6 text-gray-500">
            Loading your songs...
          </div>
  
          <div v-else-if="songs.length === 0" class="mt-6 text-gray-500">
            No songs in your playlist yet. Add your first suggestion above!
          </div>
  
          <ul v-else role="list" class="mt-6 divide-y divide-gray-200">
            <li v-for="song in songs" :key="song.id" class="py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
                  <p class="mt-1 text-sm text-gray-500">{{ song.artist }}</p>
                  <p class="mt-1 text-xs text-gray-400">
                    Duration: {{ formatDuration(song.duration) }}
                  </p>
                  <a 
                    v-if="song.link" 
                    :href="song.link" 
                    target="_blank"
                    class="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View Reference
                  </a>
                </div>
                
                <div class="flex items-center space-x-4">
                  <button
                    @click="editSong(song)"
                    class="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="removeSong(song.id)"
                    class="text-sm text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
<!-- pages/my-playlist.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import type { Database } from '~/types/supabase';

// Define the PlaylistSong type from our database types
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const store = usePlaylistStore();
const { songs, isLoading } = storeToRefs(store);

onMounted(() => {
  store.fetchMyPlaylist();
});

function formatDuration(duration: string) {
  const [minutes, seconds] = duration.split(':');
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

const handleSongAdded = () => {
  // Optionally show a success message or refresh the list
  store.fetchMyPlaylist();
};

const editSong = (song: PlaylistSong) => {
  // We'll implement this later
  console.log('Edit song:', song);
};

const removeSong = async (id: string) => {
  // We'll implement this later
  console.log('Remove song:', id);
};
</script>