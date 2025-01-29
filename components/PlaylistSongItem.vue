// components/PlaylistSongItem.vue
<template>
  <div class="space-y-4">
    <!-- Main Song Info -->
    <div class="flex items-center space-x-4">
      <!-- Setlist Checkbox -->
      <div class="flex items-center h-5">
        <input
          :id="'setlist-' + song.id"
          :checked="song.is_in_setlist"
          :disabled="!isAdmin"
          @change="$emit('setlist-toggle', song)"
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
          type="checkbox"
        >
      </div>

      <!-- Thumbnail -->
      <div class="flex-shrink-0">
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
      </div>

      <!-- Song Info -->
      <div class="flex-1">
        <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
        <p class="text-sm text-gray-500">{{ song.artist }}</p>
        <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
          <span>Duration: {{ formatDuration(song.duration) }}</span>
          <span>Added by: {{ memberName }}</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div>
        <a 
          v-if="song.link"
          :href="song.link"
          target="_blank"
          class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Reference
        </a>
      </div>
    </div>

    <!-- Notes Section -->
    <div v-if="song.notes" class="ml-12 pl-4 border-l-4 border-gray-200">
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
  isAdmin: boolean
  memberName: string
}>();

const emit = defineEmits<{
  (e: 'setlist-toggle', song: PlaylistSong): void
}>();

const { formatDuration } = useFormatDuration();
</script>