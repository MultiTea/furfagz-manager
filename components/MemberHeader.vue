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
            Spotify Playlist
          </a>
          <a 
            v-if="member.youtube_playlist"
            :href="member.youtube_playlist" 
            target="_blank"
            class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded hover:bg-opacity-90"
            :class="buttonColorClass"
          >
            YouTube Playlist
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
    const { data, error } = await supabase
      .from('band_members')
      .update({ 
        background_color: color,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.member.id)
      .select()
      .single();

    if (error) throw error;

    bgColor.value = color;    
    await membersStore.fetchMembersWithPlaylists();

    return data;
  } catch (error) {
    throw error;
  }
}

const handleImageLoad = async (event: Event) => {
  const img = event.target as HTMLImageElement;
  
  try {
    const newColor = await getMedianColor(img.src);

    if (newColor !== props.member.background_color) {
      await saveBackgroundColor(newColor);
    }

    isDarkBackground.value = checkIsDarkBackground(newColor);
  } catch (error) {
    throw error;
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