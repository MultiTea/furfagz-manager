// components/PreviewFetchButton.vue
<template>
  <div class="relative">
    <!-- Original Content -->
    <slot></slot>
    
    <!-- Preview Fetch Button - Only visible to admins for Spotify direct links -->
    <button 
      v-if="showSpotifyButton"
      @click.stop="fetchPreview"
      class="absolute top-0 right-0 bg-green-600 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3 hover:bg-green-700 transition-colors duration-200 z-10"
      title="Get audio preview"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    </button>

    <!-- YouTube to Spotify Button - Only visible to admins for YouTube links -->
    <button 
      v-if="showYouTubeToSpotifyButton"
      @click.stop="fetchSpotifyPreview"
      class="absolute top-0 right-0 bg-green-600 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3 hover:bg-green-700 transition-colors duration-200 z-10"
      title="Find Spotify preview"
    >
      <!-- Spotify Icon -->
      <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    </button>

    <!-- Loading Spinner -->
    <div 
      v-if="isUpdatingPreview"
      class="absolute top-0 right-0 bg-gray-800 bg-opacity-75 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3 z-10"
    >
      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Database } from '~/types/supabase';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const props = defineProps<{
  song: PlaylistSong,
  isAdmin: Boolean
}>();

// Added debugging for component props
onMounted(() => {
  console.log('PreviewFetchButton mounted for song:', props.song.title);
  console.log('Link:', props.song.link);
  console.log('Is admin:', props.isAdmin);
  console.log('Preview URL:', props.song.preview_url);
});

const emit = defineEmits<{
  (e: 'preview-updated', success: boolean, data?: { previewUrl?: string, thumbnailUrl?: string }): void
  (e: 'spotify-link-added', spotifyUrl: string): void
}>();

// Local state
const isUpdatingPreview = ref(false);
const supabase = useSupabaseClient<Database>();

// Show button only for Spotify links without preview URLs, and only for admins
const showSpotifyButton = computed(() => {
  const isSpotifyLink = props.song.link?.includes('spotify.com') || false;
  return isSpotifyLink && !props.song.preview_url && props.isAdmin;
});

// Show YouTube to Spotify conversion button only for YouTube links without preview URLs
const showYouTubeToSpotifyButton = computed(() => {
  const link = props.song.link || '';
  const isYouTubeLink = link.includes('youtube.com') || link.includes('youtu.be');
  const hasNoPreview = !props.song.preview_url;
  const isAdminUser = props.isAdmin;
  
  // Debug information
  console.log('Button visibility check for', props.song.title);
  console.log('- Is YouTube link:', isYouTubeLink, '(Link:', link, ')');
  console.log('- Has no preview:', hasNoPreview, '(Preview URL:', props.song.preview_url, ')');
  console.log('- Is admin:', isAdminUser);
  console.log('- Should show button:', isYouTubeLink && hasNoPreview && isAdminUser);
  
  return isYouTubeLink && hasNoPreview && isAdminUser;
});

// Extract track ID from Spotify URL
function extractTrackId(link: string): string | null {
  const regex = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})/;
  const match = link.match(regex);
  return match ? match[1] : null;
}

// Function to fetch the preview URL from Spotify direct link
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
      emit('preview-updated', false);
      return;
    }
    
    // Update the song in the database
    const { error: dbError } = await supabase
      .from('playlist_songs')
      .update({ preview_url: data.previewUrl })
      .eq('id', props.song.id);
    
    if (dbError) {
      throw dbError;
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

// Function to search Spotify for a match to a YouTube song
async function fetchSpotifyPreview() {
  if (!props.song || !props.isAdmin) return;
  
  try {
    isUpdatingPreview.value = true;
    
    // URL encode the parameters properly
    const encodedArtist = encodeURIComponent(props.song.artist);
    const encodedTitle = encodeURIComponent(props.song.title);
    const searchUrl = `/api/spotify/search?artist=${encodedArtist}&title=${encodedTitle}`;
    
    console.log('Searching for Spotify preview:', props.song.artist, props.song.title);
    
    // Fetch potential Spotify match using our API
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from Spotify search:', response.status, errorText);
      throw new Error(`Failed to search Spotify: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.found || !data.previewUrl) {
      console.warn('No Spotify match or preview found for:', props.song.title);
      emit('preview-updated', false);
      return;
    }
    
    console.log('Spotify match found:', data.trackName, 'by', data.artistName);
    
    // Prepare updates for the song
    const updates: Partial<PlaylistSong> = {
      preview_url: data.previewUrl
    };
    
    // Optionally add album image as thumbnail if none exists
    if (!props.song.thumbnail_url && data.albumImageUrl) {
      updates.thumbnail_url = data.albumImageUrl;
    }
    
    // Update the song in the database
    const { error } = await supabase
      .from('playlist_songs')
      .update(updates)
      .eq('id', props.song.id);
    
    if (error) {
      throw error;
    }
    
    // Update the song in the database only - don't modify local state directly
    const { error: updateError } = await supabase
      .from('playlist_songs')
      .update(updates)
      .eq('id', props.song.id);
    
    if (updateError) {
      throw updateError;
    }

    // Emit success with the new preview URL and other data
    emit('preview-updated', true, {
      previewUrl: data.previewUrl,
      thumbnailUrl: data.albumImageUrl
    });
    
    // If there's a Spotify URL, also emit that
    if (data.spotifyUrl) {
      emit('spotify-link-added', data.spotifyUrl);
    }
    
  } catch (error) {
    console.error('Error fetching Spotify preview:', error);
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