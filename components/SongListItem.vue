# components/SongListItem.vue
<template>
  <div class="space-y-4">
    <!-- Main Song Info -->
    <div class="flex items-center space-x-4">
      <!-- Platform Play Button -->
      <a 
        v-if="song.link"
        :href="song.link"
        target="_blank"
        class="inline-flex items-center justify-center w-10 h-10 group border border-transparent rounded-md shadow-sm shrink-0"
        :class="[
          platformInfo.color,
          platformInfo.hoverColor,
          platformInfo.textColor
        ]"
        :title="'Play on ' + platformInfo.name"
      >
        <svg 
          class="h-5 w-5 transition-opacity duration-200 group-hover:opacity-0 absolute"
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <component
          :is="platformIcon"
          class="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 absolute"
          aria-hidden="true"
        />
      </a>

      <!-- Thumbnail with Preview -->
      <div class="shrink-0 relative">
        <AudioPreview :preview-url="song.preview_url">
          <img 
            v-if="song.thumbnail_url" 
            :src="song.thumbnail_url" 
            :alt="song.title"
            class="h-14 w-14 object-cover rounded-lg"
          />
          <div 
            v-else 
            class="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <svg 
              class="h-7 w-7 text-gray-400" 
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
        </AudioPreview>

        <!-- Overlay Preview Button for Spotify links without preview -->
        <button 
          v-if="isSpotifyLink && !song.preview_url && !isUpdatingPreview"
          @click="fetchPreviewUrl"
          class="absolute top-0 right-0 bg-green-600 rounded-full p-1 shadow-md transform translate-x-1/3 -translate-y-1/3"
          title="Get audio preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5" />
          </svg>
        </button>

        <!-- Loading indicator when updating preview -->
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

      <!-- Song Info -->
      <div class="min-w-0 flex-1">
        <h4 class="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
          {{ song.title }}
        </h4>
        <p class="text-sm text-gray-500 truncate">{{ song.artist }}</p>
        
        <!-- Notes Toggle -->
        <div v-if="song.notes" class="mt-1">
          <button 
            @click="isNotesVisible = !isNotesVisible"
            class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <svg 
              class="h-4 w-4 mr-1 transition-transform duration-200" 
              :class="{ 'rotate-180': isNotesVisible }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
            {{ isNotesVisible ? 'Hide notes' : 'Show notes' }}
          </button>
        </div>
      </div>

      <!-- Duration -->
      <div class="text-sm text-gray-500 tabular-nums shrink-0">
        {{ formatDuration(song.duration) }}
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 shrink-0">
        <button
          @click="$emit('edit', song)"
          class="inline-flex items-center justify-center w-8 h-8 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
          title="Edit song"
        >
          <svg 
            class="h-4 w-4" 
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
        </button>
        
        <button
          @click="$emit('delete', song)"
          class="inline-flex items-center justify-center w-8 h-8 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
          title="Remove song"
        >
          <svg 
            class="h-4 w-4" 
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
        </button>
      </div>
    </div>

    <!-- Notes Section -->
    <div 
      v-if="song.notes && isNotesVisible" 
      class="ml-12 pl-4 border-l-4 border-gray-200"
    >
      <div class="text-sm text-gray-600 italic">
        {{ song.notes }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Database } from '~/types/supabase';
import { useFormatDuration } from '~/composables/useFormatDuration';
import { usePlatformLink } from '~/composables/usePlatformLink';
import AudioPreview from './AudioPreview.vue';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const props = defineProps<{
  song: PlaylistSong
  showActions?: boolean
}>();

const emit = defineEmits<{
  (e: 'edit', song: PlaylistSong): void
  (e: 'delete', song: PlaylistSong): void
}>();

const supabase = useSupabaseClient<Database>();
const { formatDuration } = useFormatDuration();
const { getPlatformInfo } = usePlatformLink();
const isNotesVisible = ref(false);
const isUpdatingPreview = ref(false);

const platformInfo = computed(() => getPlatformInfo(props.song.link));

// Check if the link is from Spotify
const isSpotifyLink = computed(() => {
  return props.song.link ? props.song.link.includes('spotify.com') : false;
});

// Function to extract Spotify track ID from a link
function extractSpotifyTrackId(link: string): string | null {
  const regex = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})/;
  const match = link.match(regex);
  return match ? match[1] : null;
}

// Function to fetch preview URL from our API and update the song
async function fetchPreviewUrl() {
  if (!props.song.link || !isSpotifyLink.value) return;
  
  const trackId = extractSpotifyTrackId(props.song.link);
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
    
  } catch (error) {
    console.error('Error updating preview URL:', error);
  } finally {
    isUpdatingPreview.value = false;
  }
}

const platformIcon = computed(() => {
  if (platformInfo.value.name === 'YouTube') {
    return defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', { 
          d: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z'
        })
      ])
    });
  } else if (platformInfo.value.name === 'Spotify') {
    return defineComponent({
      render: () => h('svg', { 
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', { 
          d: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'
        })
      ])
    });
  }
  return null;
});
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