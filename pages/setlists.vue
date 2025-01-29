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
          <div class="mt-6">
            <!-- List items -->
            <div>
              <!-- First drop zone -->
              <div
                class="interactive-drop-zone"
                :data-dragging="isDragging"
                :class="[
                  dropTarget === 0 ? 'bg-indigo-50' : '',
                  isDragging ? 'h-8' : 'h-2'
                ]"
                @dragover.prevent="dragOver($event, 0)"
                @dragenter.prevent="dragEnter(0)"
                                  @dragleave.prevent="dragLeave($event, 0)"
                @drop.prevent="drop($event, 0)"
              >
                <div 
                  v-show="dropTarget === 0" 
                  class="h-0.5 w-full bg-indigo-500 transform translate-y-4"
                />
              </div>

              <!-- Items with drop zones -->
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
                  <SetlistSongItem
                    :song="song"
                    :position="index + 1"
                    :is-admin="true"
                    :added-by="getMemberName(song.member_id)"
                    @remove="removeFromSetlist(song)"
                  />
                </div>

                <!-- Drop zone after each item -->
                <div
                  class="interactive-drop-zone transition-all duration-200"
                  :class="[
                    dropTarget === index + 1 ? 'bg-indigo-50' : '',
                    isDragging ? 'h-8' : 'h-2'
                  ]"
                  @dragover.prevent="dragOver($event, index + 1)"
                  @dragenter.prevent="dragEnter(index + 1)"
                  @dragleave.prevent="dragLeave($event, index + 1)"
                  @drop.prevent="drop($event, index + 1)"
                >
                  <div 
                    v-show="dropTarget === index + 1" 
                    class="h-0.5 w-full bg-indigo-500 transform translate-y-4"
                  />
                </div>
              </div>
            </div>
          </div>
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
import { useFormatDuration } from '~/composables/useFormatDuration';
import SetlistSongItem from '~/components/SetlistSongItem.vue';
import { LoadingState, ErrorState, EmptyState, BaseCard } from '~/components/ui';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];
type DropPosition = 'top' | 'bottom' | null;

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

// Drag and drop state
const isDragging = ref(false);
const draggedItem = ref<number | null>(null);
const dropTarget = ref<number | null>(null);
const dropPosition = ref<DropPosition>(null);

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

function getDropPosition(event: DragEvent): DropPosition {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const mouseY = event.clientY;
  const midPoint = rect.top + rect.height / 2;
  return mouseY < midPoint ? 'top' : 'bottom';
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

function handleDragOver(event: DragEvent, index: number) {
  dragOver(event, index);
  dropPosition.value = getDropPosition(event);
}

function dragEnter(index: number) {
  if (draggedItem.value === null || draggedItem.value === index) return;
  dropTarget.value = index;
}

function dragLeave(index: number) {
  if (dropTarget.value === index) {
    dropTarget.value = null;
    dropPosition.value = null;
  }
}

async function handleDrop(event: DragEvent, dropIndex: number) {
  const finalPosition = dropPosition.value;
  await drop(event, dropIndex);
  dropPosition.value = finalPosition;
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
  transition: all 0.2s ease;
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

/* Maintain drop target state during transitions */
.interactive-drop-zone[data-dragging="true"] {
  background-color: rgba(79, 70, 229, 0.05);
  transition-duration: 0s;
}
</style>