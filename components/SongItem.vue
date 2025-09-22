<template>
  <div
    class="space-y-4"
    :class="{
      'cursor-move': isAdmin && isSetlist,
      'cursor-pointer': !isAdmin,
    }"
  >
    <!-- Main Content -->
    <div class="flex items-center space-x-4">
      <!-- Drag Handle for Setlist (if admin) -->
      <div v-if="isAdmin && isSetlist" class="text-gray-400">
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <!-- Position Number for Setlist -->
      <div v-if="isSetlist" class="flex-none text-gray-500 font-medium w-6">
        {{ position }}.
      </div>

      <!-- Setlist Checkbox for Playlist -->
      <div v-if="isAdmin && isPlaylist" class="relative flex items-center h-5">
        <input
          :id="'setlist-' + song.id"
          :checked="song.is_in_setlist"
          @change="$emit('setlist-toggle', song)"
          type="checkbox"
          class="sr-only"
        />
        <label
          :for="'setlist-' + song.id"
          class="relative w-5 h-5 cursor-pointer border-2 rounded flex items-center justify-center transition-all duration-200"
          :class="[
            song.is_in_setlist
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white border-gray-300 hover:border-indigo-500',
          ]"
        >
          <svg
            class="w-3 h-3 text-white transition-opacity duration-200"
            :class="{ 'opacity-0': !song.is_in_setlist }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </label>
      </div>

      <!-- Platform Play Button
      <a 
        v-if="song.link"
        :href="song.link"
        target="_blank"
        class="inline-flex items-center justify-center w-10 h-10 group border border-transparent text-sm font-medium rounded-md shadow-sm shrink-0"
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
      </a> -->

      <!-- Thumbnail with Audio Preview -->
      <div class="shrink-0">
        <AudioPreview
          :preview-url="song.preview_url"
          :preview-id="'song-' + song.id"
        >
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </AudioPreview>
      </div>

      <!-- Song Info -->
      <div class="flex-1 min-w-0 flex space-x-4 items-center justify-between">
        <div class="flex-col justify-between items-start">
          <h3 class="text-md font-semibold text-gray-900 truncate">
            {{ song.title }}
          </h3>
          <p class="mt-0.5 text-sm text-gray-500 truncate">
          {{ song.artist }}
        </p>
        </div>
        <span v-if="song.duration">
          <p class="text-sm text-gray-500">
            {{ formatDuration(song.duration) }}
          </p>
        </span>
      </div>
      

      <!-- Actions -->
      <div class="flex-shrink-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed, ref } from 'vue'
import type { Database } from "~/types/supabase";
// import { usePlatformLink } from '~/composables/usePlatformLink'
import AudioPreview from "~/components/AudioPreview.vue";

const props = defineProps({
  song: {
    type: Object as () => Database["public"]["Tables"]["playlist_songs"]["Row"],
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSetlist: {
    type: Boolean,
    default: false,
  },
  isPlaylist: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["setlist-toggle"]);

// const { getPlatformInfo } = usePlatformLink()

// const platformInfo = computed(() => getPlatformInfo(props.song.link))

const isNotesVisible = ref(false)

const formatDuration = (duration: string): string => {
  const [minutes = "0", seconds = "0"] = duration.split(":");
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// const platformIcon = computed(() => {
//   if (platformInfo.value.name === 'YouTube') {
//     return defineComponent({
//       render: () => h('svg', {
//         xmlns: 'http://www.w3.org/2000/svg',
//         viewBox: '0 0 24 24',
//         fill: 'currentColor'
//       }, [
//         h('path', {
//           d: 'M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z'
//         })
//       ])
//     })
//   } else if (platformInfo.value.name === 'Spotify') {
//     return defineComponent({
//       render: () => h('svg', {
//         xmlns: 'http://www.w3.org/2000/svg',
//         viewBox: '0 0 24 24',
//         fill: 'currentColor'
//       }, [
//       h('path', {
//           d: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'
//         })
//       ])
//     })
//   }
//   return null
// })
</script>
