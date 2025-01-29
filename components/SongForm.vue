// components/SongForm.vue
<template>
  <div>
    <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Link Input -->
      <div class="relative">
        <input
          id="link"
          v-model="songData.link"
          type="url"
          :disabled="isLoading"
          placeholder=" "
          class="peer w-full pt-6 pb-2 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent"
        />
        <label 
          for="link" 
          class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
        >
          Link (YouTube/Spotify)
        </label>
        <span class="mt-1 text-xs text-gray-500">Paste a link to auto-fill details</span>
        <span v-if="errors.link" class="mt-1 text-xs text-red-600">{{ errors.link }}</span>
      </div>

      <!-- Thumbnail Preview -->
      <div v-if="songData.thumbnail_url" class="flex items-center space-x-4">
        <div class="relative group">
          <img 
            :src="songData.thumbnail_url" 
            :alt="songData.title" 
            class="h-20 w-20 object-cover rounded-lg"
          />
          <button 
            type="button" 
            @click="removeThumbnail"
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Artist Input -->
      <div class="relative">
        <input
          id="artist"
          v-model="songData.artist"
          type="text"
          required
          :disabled="isLoading"
          placeholder=" "
          class="peer w-full pt-6 pb-2 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent"
        />
        <label 
          for="artist" 
          class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
        >
          Artist
        </label>
        <span v-if="errors.artist" class="mt-1 text-xs text-red-600">{{ errors.artist }}</span>
      </div>

      <!-- Title Input -->
      <div class="relative">
        <input
          id="title"
          v-model="songData.title"
          type="text"
          required
          :disabled="isLoading"
          placeholder=" "
          class="peer w-full pt-6 pb-2 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent"
        />
        <label 
          for="title" 
          class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
        >
          Song Title
        </label>
        <span v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</span>
      </div>

      <!-- Duration Inputs -->
      <div class="grid grid-cols-2 gap-6">
        <div class="relative">
          <input
            id="minutes"
            v-model="minutes"
            type="number"
            min="0"
            required
            :disabled="isLoading"
            placeholder=" "
            class="peer w-full pt-6 pb-2 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <label 
            for="minutes" 
            class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
          >
            Minutes
          </label>
        </div>
        <div class="relative">
          <input
            id="seconds"
            v-model="seconds"
            type="number"
            min="0"
            max="59"
            required
            :disabled="isLoading"
            placeholder=" "
            class="peer w-full pt-6 pb-2 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <label 
            for="seconds" 
            class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
          >
            Seconds
          </label>
        </div>
      </div>

      <!-- Notes Input -->
      <div class="relative">
        <textarea
          id="notes"
          v-model="songData.notes"
          rows="3"
          :disabled="isLoading"
          placeholder=" "
          class="peer w-full pt-6 px-0 bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-indigo-500 transition-colors placeholder-transparent resize-none"
        />
        <label 
          for="notes" 
          class="absolute left-0 top-5 text-gray-500 text-sm -translate-y-3 scale-75 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 transition-all duration-200"
        >
          Notes (optional)
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding Song...
        </span>
        <span v-else>Add Song</span>
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
const spotifyService = new SpotifyService()

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
      const trackId = LinkParser.getSpotifyTrackId(newLink)
      if (trackId) {
        const details = await spotifyService.getTrackDetails(trackId)
        updateSongDetails(details)
      } }
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