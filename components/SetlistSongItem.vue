// components/SetlistSongItem.vue
<template>
  <div class="space-y-4">
    <!-- Main Content -->
    <div class="flex items-center space-x-4">
      <!-- Drag Handle (if admin) -->
      <div v-if="isAdmin" class="handle text-gray-400">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <!-- Position Number -->
      <div class="flex-none w-8 text-gray-500 font-medium">
        {{ position }}.
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
          <svg class="h-7 w-7 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      </div>

      <!-- Song Info -->
      <div class="flex-1">
        <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
        <p class="text-sm text-gray-500">{{ song.artist }}</p>
        <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
          <span>Duration: {{ formatDuration(song.duration) }}</span>
          <span>Added by: {{ addedBy }}</span>
          <button 
            v-if="song.notes"
            @click="isNotesVisible = !isNotesVisible"
            class="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <svg 
              class="h-4 w-4 mr-1" 
              :class="{ 'rotate-180': isNotesVisible }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              :aria-label="isNotesVisible ? 'Hide notes' : 'Show notes'"
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

      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <BaseButton
          v-if="song.link"
          :href="song.link"
          target="_blank"
          variant="secondary"
          text="View Reference"
          class="text-xs"
        />
        <BaseButton
          v-if="isAdmin"
          variant="danger"
          text="Remove"
          class="text-xs"
          @click="$emit('remove')"
        />
      </div>
    </div>

    <!-- Notes Section -->
    <div v-if="song.notes && isNotesVisible" class="ml-24 pl-4 border-l-4 border-gray-200">
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
  position: number
  isAdmin: boolean
  addedBy: string
}>();

const emit = defineEmits<{
  (e: 'remove'): void
}>();

const { formatDuration } = useFormatDuration();

// Control notes visibility
const isNotesVisible = ref(false);
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
</style>