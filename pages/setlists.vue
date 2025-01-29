// pages/setlists.vue
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <BaseCard
      title="Current Setlist"
      :description="isAdmin ? 'Drag and drop songs to reorder them.' : 'View the current setlist order.'"
    >
      <!-- Loading State -->
      <LoadingState v-if="isLoading" />

      <!-- Empty State -->
      <EmptyState 
        v-else-if="!setlistSongs || setlistSongs.length === 0"
        :message="isAdmin ? 'No songs have been added to the setlist yet. Add songs from the All Playlists page.' : 'No songs have been added to the setlist yet.'"
      />

      <!-- Content -->
      <div v-else>
        <!-- Regular list when not admin -->
        <template v-if="!isAdmin">
          <div class="mt-6 space-y-2">
            <SetlistSongItem
              v-for="(song, index) in setlistSongs"
              :key="song.id"
              :song="song"
              :position="index + 1"
              :is-admin="false"
              :added-by="getMemberName(song.member_id)"
            />
          </div>
        </template>

        <!-- Draggable list for admin -->
        <template v-else>
          <TransitionGroup 
            tag="div" 
            name="list" 
            class="mt-6 space-y-2"
            @dragstart="dragStart"
            @dragend="dragEnd"
            @dragover="dragOver"
            @dragenter="dragEnter"
            @dragleave="dragLeave"
            @drop="drop"
          >
            <div
              v-for="(song, index) in setlistSongs"
              :key="song.id"
              class="relative"
              draggable="true"
              :class="{
                'opacity-50': draggedItem === index,
                'border-indigo-500': dropTarget === index && draggedItem !== index
              }"
            >
              <!-- Drop indicator above -->
              <div
                v-if="draggedItem !== null && draggedItem !== index && dropTarget === index"
                class="absolute w-full h-2 -top-2 z-10"
              >
                <div class="h-1 w-full bg-indigo-500 rounded-full transform translate-y-1/2" />
              </div>

              <SetlistSongItem
                :song="song"
                :position="index + 1"
                :is-admin="true"
                :added-by="getMemberName(song.member_id)"
                @remove="removeFromSetlist(song)"
              />
            </div>
          </TransitionGroup>
        </template>

        <!-- Total Duration -->
        <div class="mt-6 text-sm text-gray-500">
          Total Duration: {{ formatDuration(totalDuration) }}
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import { useMembersStore } from '~/stores/members';
import type { Database } from '~/types/supabase';
import { useLoadingState } from '~/composables/useLoadingState';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import { useDragAndDrop } from '~/composables/useDragAndDrop';
import { useFormatDuration } from '~/composables/useFormatDuration';
import SetlistSongItem from '~/components/SetlistSongItem.vue';
import { LoadingState, ErrorState, EmptyState, BaseCard } from '~/components/ui';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { checkAuthAndRedirect } = useSupabaseAuth();
const { formatDuration, calculateTotalDuration } = useFormatDuration();

// Stores
const playlistStore = usePlaylistStore();
const membersStore = useMembersStore();
const { setlistSongs } = storeToRefs(playlistStore);
const { members } = storeToRefs(membersStore);

// Admin status
const isAdmin = ref(false);

// Calculate total duration
const totalDuration = computed(() => {
  const durations = setlistSongs.value.map(song => song.duration);
  return calculateTotalDuration(durations);
});

// Get member name by ID
function getMemberName(memberId: string) {
  const member = members.value.find(m => m.id === memberId);
  return member?.username || 'Unknown Member';
}

// Drag and drop functionality
const {
  draggedItem,
  dropTarget,
  dragStart,
  dragEnd,
  dragOver,
  dragEnter,
  dragLeave,
  drop
} = useDragAndDrop(setlistSongs, async (items) => {
  try {
    const updatedItems = items.map((item, index) => ({
      ...item,
      setlist_order: index + 1
    }));
    
    await playlistStore.updateSetlistOrder(updatedItems);
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
});

// Remove song from setlist
async function removeFromSetlist(song: PlaylistSong) {
  if (!isAdmin.value) return;
  
  try {
    await withLoading(async () => {
      await playlistStore.toggleSongInSetlist(song.id, false);
      await playlistStore.fetchSetlistSongs();
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
}

// Initialize data
onMounted(async () => {
  if (checkAuthAndRedirect()) {
    await withLoading(async () => {
      await Promise.all([
        playlistStore.fetchSetlistSongs(),
        membersStore.fetchMembersWithPlaylists()
      ]);
      
      // Check admin status
      const { data } = await useSupabaseClient()
        .from('band_members')
        .select('role')
        .eq('id', useSupabaseUser().value?.id)
        .single();
      
      isAdmin.value = data?.role === 'admin';
    });
  }
});
</script>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>