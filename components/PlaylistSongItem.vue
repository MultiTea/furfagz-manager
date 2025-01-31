<template>
  <div class="space-y-4">
    <!-- Main Song Info -->
    <div class="flex items-center space-x-4 me-4">
      <!-- Admin Checkbox (if admin) -->
      <div v-if="isAdmin" class="flex items-center h-5">
        <input
          :id="'setlist-' + song.id"
          :checked="song.is_in_setlist"
          @change="$emit('setlist-toggle', song)"
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          type="checkbox"
        >
      </div>

          <!-- Non-admin Checkbox -->
          <div v-if="!isAdmin" class="flex items-center h-5">
        <input
          :id="'setlist-' + song.id"
          :checked="song.is_in_setlist"
          disabled
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded opacity-50"
          type="checkbox"
        >
      </div>  

      <!-- Platform Play Button -->
      <a 
        v-if="song.link"
        :href="song.link"
        target="_blank"
        class="inline-flex items-center justify-center w-10 h-10 group border border-transparent text-sm font-medium rounded-md shadow-sm"
        :class="[
          platformInfo.color,
          platformInfo.hoverColor,
          platformInfo.textColor,
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          platformInfo.name === 'YouTube' ? 'focus:ring-red-500' : 'focus:ring-green-500'
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
      <div class="flex-1 min-w-0">
        <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
        <p class="text-sm text-gray-500">{{ song.artist }}</p>
      </div>

      <!-- Duration -->
      <div class="text-sm text-gray-500 tabular-nums">
        {{ formatDuration(song.duration) }}
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
import { computed } from 'vue';
import type { Database } from '~/types/supabase';
import { useFormatDuration } from '~/composables/useFormatDuration';
import { usePlatformLink } from '~/composables/usePlatformLink';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const props = defineProps<{
  song: PlaylistSong;
  isAdmin: boolean;
  addedBy: string;
}>();

const emit = defineEmits<{
  (e: 'setlist-toggle', song: PlaylistSong): void;
}>();

const { formatDuration } = useFormatDuration();
const { getPlatformInfo } = usePlatformLink();

const platformInfo = computed(() => getPlatformInfo(props.song.link));

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