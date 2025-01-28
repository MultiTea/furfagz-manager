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

        <!-- Loading State -->
        <div v-if="isLoading" class="mt-6 text-gray-500">
          Loading your songs...
        </div>

        <!-- Empty State -->
        <div v-else-if="songs.length === 0" class="mt-6 text-gray-500">
          No songs in your playlist yet. Add your first suggestion above!
        </div>

        <!-- Song List -->
        <ul v-else role="list" class="mt-6 divide-y divide-gray-200">
          <li v-for="song in songs" :key="song.id" class="py-4">
            <div class="flex items-center space-x-4">
              <!-- Thumbnail -->
              <div class="flex-shrink-0">
                <img 
                  v-if="song.thumbnail_url" 
                  :src="song.thumbnail_url" 
                  :alt="song.title"
                  class="h-16 w-16 object-cover rounded-lg shadow-sm"
                />
                <div 
                  v-else 
                  class="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm"
                >
                  <svg 
                    class="h-8 w-8 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                    />
                  </svg>
                </div>
              </div>

              <!-- Song Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-lg font-semibold text-gray-900 truncate">{{ song.title }}</h4>
                <p class="mt-1 text-sm text-gray-500">{{ song.artist }}</p>
                <div class="mt-1 flex items-center space-x-4">
                  <p class="text-xs text-gray-400">
                    Duration: {{ formatDuration(song.duration) }}
                  </p>
                  <span v-if="song.notes" class="text-xs text-gray-400 flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    Has notes
                  </span>
                </div>
                <div class="mt-2 flex items-center space-x-4">
                  <a 
                    v-if="song.link" 
                    :href="song.link" 
                    target="_blank"
                    class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    <svg 
                      class="mr-1 h-4 w-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                    View Reference
                  </a>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center space-x-4">
                <button
                  @click="editSong(song)"
                  class="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg 
                    class="mr-1 h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    />
                  </svg>
                  Edit
                </button>
                <button
                  @click="confirmDelete(song)"
                  class="text-sm text-red-600 hover:text-red-900 flex items-center"
                >
                  <svg 
                    class="mr-1 h-4 w-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Edit Song Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-lg w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Song</h3>
        <form @submit.prevent="handleEditSubmit" class="space-y-4">
          <div>
            <label for="edit-title" class="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="edit-title"
              v-model="editForm.title"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="edit-artist" class="block text-sm font-medium text-gray-700">Artist</label>
            <input
              id="edit-artist"
              v-model="editForm.artist"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="edit-link" class="block text-sm font-medium text-gray-700">Link</label>
            <input
              id="edit-link"
              v-model="editForm.link"
              type="url"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="edit-notes" class="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="edit-notes"
              v-model="editForm.notes"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import type { Database } from '~/types/supabase';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const store = usePlaylistStore();
const { songs, isLoading } = storeToRefs(store);

// Edit modal state
const showEditModal = ref(false);
const editForm = ref<{
  id: string;
  title: string;
  artist: string;
  link: string | null;
  notes: string | null;
  thumbnail_url: string | null;
}>({
  id: '',
  title: '',
  artist: '',
  link: null,
  notes: null,
  thumbnail_url: null
});

onMounted(() => {
  store.fetchMyPlaylist();
});

function formatDuration(duration: string) {
  const [minutes, seconds] = duration.split(':');
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

const handleSongAdded = () => {
  store.fetchMyPlaylist();
};

const editSong = (song: PlaylistSong) => {
  editForm.value = { ...song };
  showEditModal.value = true;
};

const handleEditSubmit = async () => {
  try {
    await store.updateSong(editForm.value.id, {
      title: editForm.value.title,
      artist: editForm.value.artist,
      link: editForm.value.link,
      notes: editForm.value.notes,
      thumbnail_url: editForm.value.thumbnail_url
    });
    showEditModal.value = false;
    store.fetchMyPlaylist();
  } catch (e) {
    console.error('Error updating song:', e);
  }
};

const confirmDelete = async (song: PlaylistSong) => {
  if (confirm(`Are you sure you want to remove "${song.title}" from your playlist?`)) {
    try {
      await store.deleteSong(song.id);
      store.fetchMyPlaylist();
    } catch (e) {
      console.error('Error removing song:', e);
    }
  }
};
</script>