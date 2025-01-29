// components/SongForm.vue
<template>
  <div>
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="link" class="block text-sm font-medium text-gray-700">
          Link (YouTube/Spotify)
          <span class="text-gray-500 text-xs ml-1">- Paste a link to auto-fill details</span>
        </label>
        <input
          id="link"
          v-model="songData.link"
          type="url"
          :disabled="isLoading"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <span v-if="errors.link" class="text-sm text-red-600">{{ errors.link }}</span>
      </div>

      <!-- Thumbnail Preview -->
      <div v-if="songData.thumbnail_url" class="flex items-center space-x-4">
        <img 
          :src="songData.thumbnail_url" 
          :alt="songData.title" 
          class="h-20 w-20 object-cover rounded-lg shadow-sm"
        />
        <button 
          type="button" 
          @click="removeThumbnail"
          class="text-sm text-red-600 hover:text-red-700"
        >
          Remove Thumbnail
        </button>
      </div>

      <div>
        <label for="artist" class="block text-sm font-medium text-gray-700">Artist</label>
        <input
          id="artist"
          v-model="songData.artist"
          type="text"
          required
          :disabled="isLoading"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <span v-if="errors.artist" class="text-sm text-red-600">{{ errors.artist }}</span>
      </div>

      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Song Title</label>
        <input
          id="title"
          v-model="songData.title"
          type="text"
          required
          :disabled="isLoading"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <span v-if="errors.title" class="text-sm text-red-600">{{ errors.title }}</span>
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
            :disabled="isLoading"
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
            :disabled="isLoading"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          v-model="songData.notes"
          rows="3"
          :disabled="isLoading"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLoadingState } from '~/composables/useLoadingState';
import { useFormValidation } from '~/composables/useFormValidation';
import { LinkParser } from '~/services/LinkParser';
import { YouTubeService } from '~/services/YouTubeService';
import { SpotifyService } from '~/services/SpotifyService';

const config = useRuntimeConfig();
const { isLoading, error, withLoading } = useLoadingState();
const { errors, validateForm } = useFormValidation();

const youtubeService = new YouTubeService(config.public.youtubeApiKey);
const spotifyService = new SpotifyService(config.public.spotifyAccessToken);

const emit = defineEmits<{
  (e: 'added'): void
}>();

const songData = ref({
  artist: '',
  title: '',
  link: '',
  notes: '',
  thumbnail_url: ''
});

const minutes = ref(0);
const seconds = ref(0);

// Validation rules
const validationRules = {
  artist: [{ validate: (v: string) => !!v.trim(), message: 'Artist is required' }],
  title: [{ validate: (v: string) => !!v.trim(), message: 'Title is required' }],
  link: [{ 
    validate: (v: string) => !v || /^https?:\/\//i.test(v), 
    message: 'Link must be a valid URL' 
  }]
};

// Watch for link changes to auto-fill data
watch(() => songData.value.link, async (newLink: string) => {
  if (!newLink) return;
  
  try {
    if (newLink.includes('youtube.com') || newLink.includes('youtu.be')) {
      const videoId = LinkParser.getYouTubeVideoId(newLink);
      if (videoId) {
        const details = await youtubeService.getVideoDetails(videoId);
        updateSongDetails(details);
      }
    } else if (newLink.includes('spotify.com')) {
      const trackId = LinkParser.getSpotifyTrackId(newLink);
      if (trackId) {
        const details = await spotifyService.getTrackDetails(trackId);
        updateSongDetails(details);
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
});

function updateSongDetails(details: any) {
  songData.value.title = details.title;
  songData.value.artist = details.artist;
  songData.value.thumbnail_url = details.thumbnailUrl;
  minutes.value = details.duration.minutes;
  seconds.value = details.duration.seconds;
}

function removeThumbnail() {
  songData.value.thumbnail_url = '';
}

async function handleSubmit() {
  if (!validateForm(songData.value, validationRules)) {
    return;
  }

  try {
    await withLoading(async () => {
      const duration = `${minutes.value}:${seconds.value.toString().padStart(2, '0')}:00`;
      
      // Emit the new song data
      await usePlaylistStore().addSong({
        ...songData.value,
        duration
      });

      // Reset form
      songData.value = {
        artist: '',
        title: '',
        link: '',
        notes: '',
        thumbnail_url: ''
      };
      minutes.value = 0;
      seconds.value = 0;

      emit('added');
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
}
</script>