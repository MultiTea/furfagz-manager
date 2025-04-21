// components/MemberHeader.vue
<template>
  <div
    class="px-4 py-5 sm:px-6 transition-colors duration-300"
    :style="{ backgroundColor: bgColor }"
  >
    <div class="flex items-center space-x-4">
      <div class="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <img
          v-if="member.avatar_url"
          :src="member.avatar_url"
          :alt="member.username"
          class="w-full h-full object-cover"
          @load="handleImageLoad"
          loading="lazy"
          crossorigin="anonymous"
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

      <div class="flex-1 min-w-0">
        <h3 
          class="text-lg font-semibold truncate"
          :class="textColorClass"
        >
          {{ member.username }}
        </h3>
        <p 
          class="text-sm"
          :class="subTextColorClass"
        >
          {{ member.band_role }}
        </p>
        
        <div v-if="member.band_role" class="mt-2 flex space-x-2">
          <a 
            v-if="member.spotify_playlist"
            :href="member.spotify_playlist" 
            target="_blank"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded hover:bg-opacity-90"
            :class="buttonColorClass"
          >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6"
            fill="currentColor" 
            viewBox="0 0 24 24" 
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'" 
            />
          </svg>
          <p class="px-2">Spotify playlist</p>
          </a>
          <a 
            v-if="member.youtube_playlist"
            :href="member.youtube_playlist" 
            target="_blank"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded hover:bg-opacity-90"
            :class="buttonColorClass"
          >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6"
            fill="currentColor" 
            viewBox="0 0 24 24" 
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" 
            />
          </svg>
          <p class="px-2">YouTube playlist</p>
          </a>
        </div>
      </div>

      <div class="flex-shrink-0">
        <span 
          class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="badgeColorClass"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-3.5 w-3.5"
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
          {{ selectedCount }} selected
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Database } from '~/types/supabase';
import { useImageColor } from '~/composables/useImageColor';
import { useMembersStore } from '~/stores/members';

type BandMember = Database['public']['Tables']['band_members']['Row'];

const props = defineProps<{
  member: BandMember;
  selectedCount: string;
}>();

const supabase = useSupabaseClient<Database>();
const { getMedianColor } = useImageColor();
const membersStore = useMembersStore();

const bgColor = ref(props.member.background_color || 'rgb(249, 250, 251)');
const isDarkBackground = ref(false);

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function checkIsDarkBackground(color: string) {
  const rgb = color.match(/\d+/g);
  if (!rgb || rgb.length < 3) return false;
  
  const luminance = getLuminance(
    parseInt(rgb[0]),
    parseInt(rgb[1]),
    parseInt(rgb[2])
  );
  
  return luminance < 0.5;
}

async function saveBackgroundColor(color: string) {
  try {
    const { error } = await supabase
      .from('band_members')
      .update({ background_color: color })
      .eq('id', props.member.id);

    if (error) {
      console.error('Error saving background color:', error);
    }
  } catch (error) {
    console.error('Error saving background color:', error);
    // Just log the error but don't throw it to prevent breaking the UI
  }
}

const handleImageLoad = async () => {
  if (props.member.avatar_url) {
    try {
      // If we don't have a stored color, calculate and save it
      if (!props.member.background_color) {
        const newColor = await getMedianColor(props.member.avatar_url);
        bgColor.value = newColor;
        await saveBackgroundColor(newColor);
      }
      isDarkBackground.value = checkIsDarkBackground(bgColor.value);
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to a default color if there's an error
      bgColor.value = 'rgb(249, 250, 251)';
      isDarkBackground.value = false;
    }
  }
};

const textColorClass = computed(() => ({
  'text-white': isDarkBackground.value,
  'text-gray-900': !isDarkBackground.value,
}));

const subTextColorClass = computed(() => ({
  'text-gray-200': isDarkBackground.value,
  'text-gray-600': !isDarkBackground.value,
}));

const buttonColorClass = computed(() => ({
  'bg-white/20 text-white': isDarkBackground.value,
  'bg-gray-900/10 text-gray-900': !isDarkBackground.value,
}));

const badgeColorClass = computed(() => ({
  'bg-white/20 text-white': isDarkBackground.value,
  'bg-gray-900/10 text-gray-900': !isDarkBackground.value,
}));

onMounted(() => {
  if (props.member.avatar_url && props.member.background_color) {
    isDarkBackground.value = checkIsDarkBackground(props.member.background_color);
  }
});
</script>