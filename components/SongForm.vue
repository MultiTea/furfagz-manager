<!-- components/SongForm.vue -->
<template>
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
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
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

    <button
      type="submit"
      :disabled="isLoading"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {{ isLoading ? 'Adding...' : 'Add Song' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';

const store = usePlaylistStore();
const { isLoading } = storeToRefs(store);
const config = useRuntimeConfig();

const emit = defineEmits<{
  (e: 'added'): void
}>();

const songData = ref({
  artist: '',
  title: '',
  link: '',
  thumbnail_url: ''
});

const minutes = ref(0);
const seconds = ref(0);
const error = ref<string | null>(null);

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function getSpotifyTrackId(url: string): string | null {
  const regExp = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

async function fetchSpotifyMetadata(trackId: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': 'Bearer ' + config.public.spotifyAccessToken
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update form data including thumbnail
    songData.value.title = data.name;
    songData.value.artist = data.artists[0].name;
    songData.value.thumbnail_url = data.album.images[1]?.url || data.album.images[0]?.url || '';
    
    // Convert duration from milliseconds
    const durationInSeconds = Math.floor(data.duration_ms / 1000);
    minutes.value = Math.floor(durationInSeconds / 60);
    seconds.value = durationInSeconds % 60;

  } catch (e) {
    console.error('Error fetching Spotify metadata:', e);
    error.value = 'Failed to fetch track details. Please enter them manually.';
  }
}

async function fetchYouTubeMetadata(videoId: string) {
  try {
    if (!config.public.youtubeApiKey) {
      throw new Error('YouTube API key is not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      new URLSearchParams({
        id: videoId,
        part: 'snippet,contentDetails,status',
        key: config.public.youtubeApiKey
      })
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private');
    }

    const video = data.items[0];
    songData.value.title = video.snippet.title;
    songData.value.artist = video.snippet.channelTitle;
    songData.value.thumbnail_url = video.snippet.thumbnails.default?.url || 
                                 video.snippet.thumbnails.medium?.url || '';

    // Parse duration from ISO 8601 format
    const duration = video.contentDetails.duration;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const [, hours, mins, secs] = match;
      minutes.value = parseInt(mins || '0') + (parseInt(hours || '0') * 60);
      seconds.value = parseInt(secs || '0');
    }
  } catch (e) {
    console.error('Error fetching YouTube metadata:', e);
    error.value = 'Failed to fetch video details. Please enter them manually.';
    throw e;
  }
}

watch(() => songData.value.link, async (newLink: string) => {
  if (!newLink) return;
  
  try {
    if (newLink.includes('youtube.com') || newLink.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(newLink);
      if (videoId) {
        await fetchYouTubeMetadata(videoId);
      }
    } else if (newLink.includes('spotify.com')) {
      const trackId = getSpotifyTrackId(newLink);
      if (trackId) {
        await fetchSpotifyMetadata(trackId);
      }
    }
  } catch (e) {
    console.error('Error processing link:', e);
  }
});

function removeThumbnail() {
  songData.value.thumbnail_url = '';
}

const handleSubmit = async () => {
  error.value = null;
  
  try {
    const duration = `${minutes.value}:${seconds.value.toString().padStart(2, '0')}:00`;
    
    await store.addSong({
      ...songData.value,
      duration,
      notes: null
    });

    // Reset form
    songData.value = {
      artist: '',
      title: '',
      link: '',
      thumbnail_url: ''
    };
    minutes.value = 0;
    seconds.value = 0;

    emit('added');
  } catch (e: any) {
    error.value = e.message;
  }
};
</script>