// components/SongListItem.vue
<template>
  <div class="space-y-4">
    <!-- Main Song Info -->
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
        <p class="text-sm text-gray-500">{{ song.artist }}</p>
        <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
          <span>Duration: {{ formatDuration(song.duration) }}</span>
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
      <div v-if="showActions" class="flex items-center space-x-4">
        <button
          @click="$emit('edit', song)"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg 
            class="h-4 w-4 mr-1.5" 
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
          @click="$emit('delete', song)"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg 
            class="h-4 w-4 mr-1.5" 
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

    <!-- Notes Section -->
    <div v-if="song.notes" class="ml-16 pl-4 border-l-4 border-gray-200">
      <div class="text-sm text-gray-600 italic">
        {{ song.notes }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase';
import { useFormatDuration } from '~/composables/useFormatDuration';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const props = defineProps<{
  song: PlaylistSong
  showActions?: boolean
}>();

const emit = defineEmits<{
  (e: 'edit', song: PlaylistSong): void
  (e: 'delete', song: PlaylistSong): void
}>();

const { formatDuration } = useFormatDuration();
</script>