<!-- components/SongForm.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist'; // Updated import

// Initialize the store and get reactive refs
const store = usePlaylistStore();
const { isLoading } = storeToRefs(store);

const emit = defineEmits<{
  (e: 'added'): void
}>();

const songData = ref({
  artist: '',
  title: '',
  link: ''
});

const minutes = ref(0);
const seconds = ref(0);
const error = ref<string | null>(null);

const handleSubmit = async () => {
  error.value = null;
  
  try {
    // Convert minutes and seconds to PostgreSQL interval format
    const duration = `${minutes.value}:${seconds.value.toString().padStart(2, '0')}:00`;
    
    await store.addSong({
      ...songData.value,
      duration,
      notes: null // Added to match our new playlist_songs schema
    });

    // Reset form
    songData.value = {
      artist: '',
      title: '',
      link: ''
    };
    minutes.value = 0;
    seconds.value = 0;

    emit('added');
  } catch (e: any) {
    error.value = e.message;
  }
};
</script>

<template>
  <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
    {{ error }}
  </div>
  
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label for="artist" class="block text-sm font-medium text-gray-700">Artist</label>
      <input
        id="artist"
        v-model="songData.artist"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">Song Title</label>
      <input
        id="title"
        v-model="songData.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="minutes" class="block text-sm font-medium text-gray-700">Minutes</label>
        <input
          id="minutes"
          v-model="minutes"
          type="number"
          min="0"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="seconds" class="block text-sm font-medium text-gray-700">Seconds</label>
        <input
          id="seconds"
          v-model="seconds"
          type="number"
          min="0"
          max="59"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    <div>
      <label for="link" class="block text-sm font-medium text-gray-700">Link (YouTube/Spotify)</label>
      <input
        id="link"
        v-model="songData.link"
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>

    <button
      type="submit"
      :disabled="isLoading"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {{ isLoading ? 'Adding...' : 'Add Song' }}
    </button>
  </form>
</template>