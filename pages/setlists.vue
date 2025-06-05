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
          <div class="mt-6 space-y-4">
            <SongItem
              v-for="(song, index) in setlistSongs"
              :key="song.id"
              :song="song"
              :position="index + 1"
              :is-setlist="true"
              :is-admin="false"
            >
              <template #actions>
                <img :src="getMemberName(song.member_id)" class="w-10 h-10 rounded-full object-cover"/>
              </template>
            </SongItem>
          </div>
        </template>

        <!-- Draggable list for admin -->
        <template v-else>
          <div class="mt-6">
            <!-- First drop zone -->
            <div
              class="interactive-drop-zone transition-all duration-200"
              :class="[
                dropTarget === 0 ? 'bg-indigo-50 h-8' : 'h-2'
              ]"
              @dragover.prevent="dragOver($event, 0)"
              @dragenter.prevent="dragEnter(0)"
              @dragleave.prevent="dragLeave(0)"
              @drop.prevent="drop($event, 0)"
            >
              <div 
                v-show="dropTarget === 0" 
                class="h-0.5 w-full bg-indigo-500 transform translate-y-4"
              />
            </div>

            <!-- List items -->
            <div>
              <div
                v-for="(song, index) in setlistSongs"
                :key="song.id"
              >
                <!-- Draggable item -->
                <div
                  draggable="true"
                  @dragstart="dragStart($event, index)"
                  @dragend="dragEnd"
                  :class="{ 'opacity-50': draggedItem === index }"
                >
                  <SongItem
                    :song="song"
                    :position="index + 1"
                    :is-setlist="true"
                    :is-admin="true"
                  >
                    <template #actions>
                      <div class="flex items-center space-x-2">
                        <img :src="getMemberName(song.member_id)" class="w-10 h-10 rounded-full object-cover"/>
                        
                        <button
                          @click="removeFromSetlist(song)"
                          class="text-red-500 hover:text-red-600"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </template>
                  </SongItem>
                </div>

                <!-- Drop zone after each item -->
                <div
                  class="interactive-drop-zone transition-all duration-200"
                  :class="[
                    dropTarget === index + 1 ? 'bg-indigo-50 h-8 border-2 rounded border-indigo-500' : 'h-2'
                  ]"
                  @dragover.prevent="dragOver($event, index + 1)"
                  @dragenter.prevent="dragEnter(index + 1)"
                  @dragleave.prevent="dragLeave(index + 1)"
                  @drop.prevent="drop($event, index + 1)"
                >
                  <div 
                    v-show="dropTarget === index + 1" 
                    class="w-full transform translate-y-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Setlist Footer -->
        <div class="mt-8 pt-4 border-t border-gray-200">
          <div class="flex flex-col space-y-3">
            <!-- Stats Row -->
            <div class="flex justify-between items-center text-sm">
            <!-- Left side stats -->
            <div class="space-y-2">
              <div class="flex items-center space-x-2 text-gray-600">
                <svg 
                  class="h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
                <span>Total Songs: {{ setlistSongs.length }}</span>
              </div>
              
              <!-- Last Updated -->
              <div class="flex items-center space-x-2 text-gray-500">
                <svg 
                  class="h-5 w-5 text-gray-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span>Last Updated: {{ lastUpdated }}</span>
              </div>
            </div>

            <!-- Right side - Duration -->
            <div class="flex items-center space-x-2 text-gray-600">
              <svg 
                class="h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>Total Duration: {{ formattedTotalDuration }}</span>
            </div>
          </div>
        </div>
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
import { useFormatDuration } from '~/composables/useFormatDuration';
import SetlistSongItem from '~/components/SetlistSongItem.vue';
import { LoadingState, ErrorState, EmptyState, BaseCard } from '~/components/ui';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { checkAuthAndRedirect } = useSupabaseAuth();
const { formatDuration } = useFormatDuration();

// Stores
const playlistStore = usePlaylistStore();
const membersStore = useMembersStore();
const { setlistSongs } = storeToRefs(playlistStore);
const { members } = storeToRefs(membersStore);

// Admin status
const isAdmin = ref(false);

// Drag and drop state
const isDragging = ref(false);
const draggedItem = ref<number | null>(null);
const dropTarget = ref<number | null>(null);
const dropPosition = ref<'top' | 'bottom' | null>(null);

// Store reference for latest update
const latestUpdate = ref<Date>(new Date());

// Update the timestamp whenever the setlist changes
watch(() => setlistSongs.value, () => {
  latestUpdate.value = new Date();
}, { deep: true });

// Calculate the last update time
const lastUpdated = computed(() => {
  if (setlistSongs.value.length === 0) return 'Never';
  
  return latestUpdate.value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Calculate total duration in seconds and format it
const formattedTotalDuration = computed(() => {
  let totalSeconds = 0;
  
  setlistSongs.value.forEach(song => {
    const [minutes = '0', seconds = '0'] = song.duration.split(':');
    totalSeconds += parseInt(minutes) * 60 + parseInt(seconds);
  });

  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});

// Get member name by ID
function getMemberName(memberId: string) {
  const member = members.value.find(m => m.id === memberId);
  return member?.avatar_url || 'Unknown Member';
}

// Drag and drop handlers
function dragStart(event: DragEvent, index: number) {
  isDragging.value = true;
  draggedItem.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function dragEnd() {
  isDragging.value = false;
  draggedItem.value = null;
  dropTarget.value = null;
  dropPosition.value = null;
}

function dragOver(event: DragEvent, index: number) {
  if (draggedItem.value === null || draggedItem.value === index) return;
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
}

function dragEnter(index: number) {
  if (draggedItem.value === null || draggedItem.value === index) return;
  dropTarget.value = index;
}

function dragLeave(index: number) {
  if (dropTarget.value === index) {
    const relatedTarget = document.querySelector('.interactive-drop-zone:hover');
    if (!relatedTarget) {
      dropTarget.value = null;
      dropPosition.value = null;
    }
  }
}

async function drop(event: DragEvent, dropIndex: number) {
  event.preventDefault();
  
  if (draggedItem.value === null || draggedItem.value === dropIndex) return;
  
  try {
    const newSongs = [...setlistSongs.value];
    const [removed] = newSongs.splice(draggedItem.value, 1);
    newSongs.splice(dropIndex, 0, removed);
    
    // Update the order in the store
    await playlistStore.updateSetlistOrder(newSongs);
    // Update the timestamp
    latestUpdate.value = new Date();
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  } finally {
    draggedItem.value = null;
    dropTarget.value = null;
    isDragging.value = false;
  }
}

// Remove song from setlist
async function removeFromSetlist(song: PlaylistSong) {
  if (!isAdmin.value) return;
  
  try {
    await withLoading(async () => {
      await playlistStore.toggleSongInSetlist(song.id, false);
      await playlistStore.fetchSetlistSongs();
      // Update the timestamp
      latestUpdate.value = new Date();
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

<style scoped>
.interactive-drop-zone {
  position: relative;
  z-index: 10;
  margin: 0;
  pointer-events: all;
  min-height: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-drop-zone:hover {
  background-color: rgba(79, 70, 229, 0.03);
  
}

/* Increase the hit area using pseudo-elements */
.interactive-drop-zone::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: -8px;
  z-index: 1;
}

/* Only highlight active drop target */
.interactive-drop-zone.bg-indigo-50 {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}
</style>