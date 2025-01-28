<!-- components/SongForm.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';

// Initialize the store and get reactive refs
const store = usePlaylistStore();
const { isLoading } = storeToRefs(store);
const config = useRuntimeConfig();

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

function getYouTubeVideoId(url: string): string | null {
  console.log('Parsing YouTube URL:', url);
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[7].length === 11) ? match[7] : null;
  console.log('YouTube video ID:', videoId);
  return videoId;
}

function getSpotifyTrackId(url: string): string | null {
  console.log('Parsing Spotify URL:', url);
  const regExp = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/;
  const match = url.match(regExp);
  const trackId = match ? match[1] : null;
  console.log('Spotify track ID:', trackId);
  return trackId;
}

async function fetchSpotifyMetadata(trackId: string) {
  console.log('Starting Spotify fetch for track:', trackId);
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': 'Bearer ' + config.public.spotifyAccessToken
      }
    });

    console.log('Spotify API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API error:', errorText);
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Spotify track data:', data);
    
    // Update form data
    songData.value.title = data.name;
    songData.value.artist = data.artists[0].name;
    
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

    console.log('YouTube API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('YouTube video data:', data);

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private');
    }

    const video = data.items[0];
    songData.value.title = video.snippet.title;
    songData.value.artist = video.snippet.channelTitle;

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
  console.log('Link changed to:', newLink);
  if (!newLink) return;
  console.log('Processing link:', newLink);
  
  try {
    if (newLink.includes('youtube.com') || newLink.includes('youtu.be')) {
      console.log('Detected YouTube URL');
      const videoId = getYouTubeVideoId(newLink);
      console.log('Extracted video ID:', videoId);
      if (videoId) {
        await fetchYouTubeMetadata(videoId);
      }
    } else if (newLink.includes('spotify.com')) {
      console.log('Detected Spotify URL');
      const trackId = getSpotifyTrackId(newLink);
      console.log('Extracted track ID:', trackId);
      if (trackId) {
        await fetchSpotifyMetadata(trackId);
      } else {
        console.log('Failed to extract track ID');
      }
    } else {
      console.log('URL not recognized as YouTube or Spotify');
    }
  } catch (e) {
    console.error('Error processing link:', e);
  }
});

const handleSubmit = async () => {
  error.value = null;
  
  try {
    // Convert minutes and seconds to PostgreSQL interval format
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