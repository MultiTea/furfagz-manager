// components/SongForm.vue
<template>
  <div class="mt-8">
    <!-- Error Message -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Link Input Section (Centered) -->
    <div class="max-w-2xl mx-auto mb-12">
      <span class="block text-xs text-gray-500 text-center mb-4">
        Paste a link to auto-fill details or add them manually
      </span>
      <div class="relative flex border-0 border-b-2 border-gray-200 items-end">
        <label 
          for="link" 
          class="text-gray-500 text-sm scale-75 transition-all duration-200"
        >
          Link (YouTube/Spotify)
        </label>
        <input
          id="link"
          v-model="songData.link"
          type="url"
          :disabled="isLoading"
          placeholder=" "
          class="ml-6 text-xl bg-transparent border-none focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder-transparent flex-1"
        />
      </div>
      <span v-if="errors.link" class="mt-2 block text-xs text-red-600">{{ errors.link }}</span>
    </div>

<!-- Expandable Form Section (Full Width) -->
<div 
      v-if="songData.link"
      class="transition-all duration-500 ease-in-out"
      :class="[
        'opacity-0 translate-y-4',
        showExpandedForm ? 'opacity-100 translate-y-0' : ''
      ]"
    >
      <div class="flex flex-col gap-6">
        <!-- Thumbnail Section -->
        <div class="w-full flex justify-center">
          <div class="w-full max-w-sm">
            <div v-if="songData.thumbnail_url" class="relative group">
              <img 
                :src="songData.thumbnail_url" 
                :alt="songData.title"
                class="w-full aspect-square object-cover rounded-lg shadow-md"
              />
              <button 
                type="button" 
                @click="removeThumbnail"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200"
              >
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-else class="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5M8 8v8m8 4h2a2 2 0 002-2V6a2 2 0 00-2-2h-2M4 6v12a2 2 0 002 2h2M4 6V4a2 2 0 012-2h12a2 2 0 012 2v2M4 6h16" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleSubmit" class="flex-1 space-y-12">
          <!-- Artist Input -->
          <div class="relative flex border-0 border-b-2 border-gray-200 items-end">
            <label 
              for="artist" 
              class="text-gray-500 text-sm scale-75 transition-all duration-200"
            >
              Artist
            </label>
            <input
              id="artist"
              v-model="songData.artist"
              type="text"
              required
              :disabled="isLoading"
              placeholder=" "
              class="ml-6 text-xl bg-transparent border-none focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder-transparent flex-1"
            />
          </div>
          <span v-if="errors.artist" class="mt-2 block text-xs text-red-600">{{ errors.artist }}</span>

          <!-- Title Input -->
          <div class="relative flex border-0 border-b-2 border-gray-200 items-end">
            <label 
              for="title" 
              class="text-gray-500 text-sm scale-75 transition-all duration-200"
            >
              Song Title
            </label>
            <input
              id="title"
              v-model="songData.title"
              type="text"
              required
              :disabled="isLoading"
              placeholder=" "
              class="ml-6 text-xl bg-transparent border-none focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder-transparent flex-1"
            />
          </div>
          <span v-if="errors.title" class="mt-2 block text-xs text-red-600">{{ errors.title }}</span>

          <!-- Duration Input -->
          <div class="relative flex border-0 border-b-2 border-gray-200 items-end">
            <label 
              for="duration" 
              class="text-gray-500 text-sm scale-75 transition-all duration-200"
            >
              Duration
            </label>
            <input
              id="duration"
              v-model="formattedDuration"
              type="text"
              required
              :disabled="isLoading"
              placeholder=" "
              @input="handleDurationInput"
              class="ml-6 text-xl bg-transparent border-none focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder-transparent flex-1"
            />
          </div>
          <span v-if="errors.duration" class="mt-2 block text-xs text-red-600">{{ errors.duration }}</span>

          <!-- Notes Input -->
          <div class="relative flex border-0 border-b-2 border-gray-200 items-start pt-2">
            <label 
              for="notes" 
              class="text-gray-500 text-sm scale-75 transition-all duration-200"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              v-model="songData.notes"
              rows="3"
              :disabled="isLoading"
              placeholder=" "
              class="ml-6 text-xl bg-transparent border-none focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors placeholder-transparent resize-none flex-1"
            />
          </div>

          <!-- Form Actions -->
          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-auto py-3 px-8 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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

            <button
              type="button"
              @click="resetForm"
              :disabled="isLoading"
              class="w-auto py-3 px-8 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
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
const spotifyService = new SpotifyService();

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

// Animation control
const showExpandedForm = ref(false);

// Validation rules
const validationRules = {
  artist: [{ validate: (v: string) => !!v.trim(), message: 'Artist is required' }],
  title: [{ validate: (v: string) => !!v.trim(), message: 'Title is required' }],
  link: [{ 
    validate: (v: string) => !v || /^https?:\/\//i.test(v), 
    message: 'Link must be a valid URL' 
  }],
  duration: [{
    validate: () => {
      const { minutes, seconds } = duration.value;
      return minutes > 0 || seconds > 0;
    },
    message: 'Duration is required'
  }]
};

// Duration handling
const duration = ref({ minutes: 0, seconds: 0 });
const formattedDuration = computed({
  get: () => {
    const minutes = duration.value.minutes;
    const seconds = duration.value.seconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  },
  set: (value: string) => {
    const [mins, secs] = value.split(':').map(v => parseInt(v) || 0);
    duration.value = {
      minutes: mins,
      seconds: Math.min(secs || 0, 59)
    };
  }
});

watch(() => songData.value.link, (newLink) => {
  if (newLink) {
    // Delay showing the expanded form to allow for a smooth transition
    setTimeout(() => {
      showExpandedForm.value = true;
    }, 100);
  } else {
    showExpandedForm.value = false;
  }
});

function handleDurationInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^\d:]/g, '');
  
  if (value.includes(':')) {
    const [mins, secs] = value.split(':');
    if (secs?.length > 2) {
      value = `${mins}:${secs.slice(0, 2)}`;
    }
  } else if (value.length > 0) {
    if (value.length <= 2) {
      value = `0:${value.padStart(2, '0')}`;
    } else {
      value = `${value.slice(0, -2)}:${value.slice(-2)}`;
    }
  }
  
  formattedDuration.value = value;
}

// Auto-fill from link remains unchanged...
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
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
});

function resetForm() {
  songData.value = {
    artist: '',
    title: '',
    link: '',
    notes: '',
    thumbnail_url: ''
  };
  duration.value = { minutes: 0, seconds: 0 };
  error.value = null;
  errors.value = {};
  showExpandedForm.value = false;
}

function updateSongDetails(details: any) {
  songData.value.title = details.title;
  songData.value.artist = details.artist;
  songData.value.thumbnail_url = details.thumbnailUrl;
  duration.value = details.duration;
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
      const durationString = `${duration.value.minutes}:${duration.value.seconds.toString().padStart(2, '0')}:00`;
      
      // Emit the new song data
      await usePlaylistStore().addSong({
        ...songData.value,
        duration: durationString
      });

      // Reset form
      songData.value = {
        artist: '',
        title: '',
        link: '',
        notes: '',
        thumbnail_url: ''
      };
      duration.value = { minutes: 0, seconds: 0 };

      emit('added');
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
}
</script>