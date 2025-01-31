<template>
  <div
    class="px-4 py-5 sm:px-6 transition-colors duration-300"
    :style="{ backgroundColor: bgColor }"
  >
    <div class="flex items-center space-x-4">
      <!-- Avatar -->
      <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <img
          v-if="member.avatar_url"
          :src="member.avatar_url"
          :alt="member.username"
          class="w-full h-full object-cover"
          @load="updateBgColor"
        />
        <div
          v-else
          class="w-full h-full bg-indigo-100 flex items-center justify-center"
        >
          <span class="text-indigo-600 text-xl font-semibold">
            {{ member.username?.[0]?.toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Member Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 truncate">
          {{ member.username }}
        </h3>
        <p class="text-sm text-gray-500">{{ member.band_role }}</p>
        
        <!-- Platform Links -->
        <div v-if="member.band_role" class="mt-2 flex space-x-2">
          <a 
            v-if="member.spotify_playlist"
            :href="member.spotify_playlist" 
            target="_blank"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
          >
            Spotify Playlist
          </a>
          <a 
            v-if="member.youtube_playlist"
            :href="member.youtube_playlist" 
            target="_blank"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
          >
            YouTube Playlist
          </a>
        </div>
      </div>

      <!-- Stats Badge -->
      <div class="flex-shrink-0">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {{ selectedCount }} selected
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Database } from '~/types/supabase';
import { useImageColor } from '~/composables/useImageColor';

type BandMember = Database['public']['Tables']['band_members']['Row'];

const props = defineProps<{
  member: BandMember;
  selectedCount: string;
}>();

const { getMedianColor } = useImageColor();
const bgColor = ref('rgb(249, 250, 251)'); // Default gray-50

const updateBgColor = async () => {
  if (props.member.avatar_url) {
    bgColor.value = await getMedianColor(props.member.avatar_url);
  }
};

onMounted(updateBgColor);
</script>