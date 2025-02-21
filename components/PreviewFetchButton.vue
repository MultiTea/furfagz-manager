// components/PreviewFetchButton.vue
<template>
  <div class="relative">
    <!-- Original Content -->
    <slot></slot>
    
    <!-- Preview Fetch Button - Only visible to admins -->
    <button 
      v-if="showButton"
      @click.stop="fetchPreview"
      class="absolute top-0 right-0 bg-green-600 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3 hover:bg-green-700 transition-colors duration-200"
      title="Get audio preview"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    </button>

    <!-- Loading Spinner -->
    <div 
      v-if="isUpdatingPreview"
      class="absolute top-0 right-0 bg-gray-800 bg-opacity-75 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3"
    >
      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { Database } from '~/types/supabase';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const props = defineProps<{
  song: PlaylistSong,
  isAdmin: Boolean // Pass this from parent instead of using composable
}>();

const emit = defineEmits<{
  (e: 'preview-updated', success: boolean): void
}>();

// Local state
const isUpdatingPreview = ref(false);
const supabase = useSupabaseClient<Database>();

// Show button only for Spotify links without preview URLs, and only for admins
const showButton = computed(() => {
  const isSpotifyLink = props.song.link?.includes('spotify.com') || false;
  return isSpotifyLink && !props.song.preview_url && props.isAdmin;
});

// Extract track ID from Spotify URL
function extractTrackId(link: string): string | null {
  const regex = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})/;
  const match = link.match(regex);
  return match ? match[1] : null;
}

// Function to fetch the preview URL
async function fetchPreview() {
  if (!props.song.link || !props.isAdmin) return;
  
  const trackId = extractTrackId(props.song.link);
  if (!trackId) {
    console.error('Could not extract track ID from link:', props.song.link);
    return;
  }
  
  try {
    isUpdatingPreview.value = true;
    
    // Fetch preview URL from our API
    const response = await fetch(`/api/spotify/get-preview?trackId=${trackId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.previewUrl) {
      console.warn('No preview URL found for track:', trackId);
      return;
    }
    
    // Update the song in the database
    const { error } = await supabase
      .from('playlist_songs')
      .update({ preview_url: data.previewUrl })
      .eq('id', props.song.id);
    
    if (error) {
      throw error;
    }
    
    // Update the song in the local state
    props.song.preview_url = data.previewUrl;
    emit('preview-updated', true);
    
  } catch (error) {
    console.error('Error updating preview URL:', error);
    emit('preview-updated', false);
  } finally {
    isUpdatingPreview.value = false;
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>