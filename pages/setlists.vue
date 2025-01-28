<!-- pages/setlists.vue -->
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Current Setlist</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ isAdmin ? 'Drag and drop songs to reorder them.' : 'View the current setlist order.' }}
        </p>

        <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-400 rounded text-red-700">
          {{ error }}
        </div>

        <div v-if="isLoading" class="mt-4 text-gray-500">
          Loading setlist...
        </div>

        <div v-else-if="!setlistSongs || setlistSongs.length === 0" class="mt-4 text-gray-500">
          No songs have been added to the setlist yet.
          {{ isAdmin ? 'Add songs from the All Playlists page.' : '' }}
        </div>

        <div v-else>
          <!-- Regular list when not admin -->
          <template v-if="!isAdmin">
            <div class="mt-6 space-y-2">
              <div 
                v-for="(song, index) in setlistSongs" 
                :key="song.id"
                class="bg-white border rounded-lg p-4 flex items-center space-x-4"
              >
                <div class="flex-none w-8 text-gray-500 font-medium">
                  {{ index + 1 }}.
                </div>

                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
                  <p class="text-sm text-gray-500">{{ song.artist }}</p>
                  <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Duration: {{ formatDuration(song.duration) }}</span>
                    <span>Added by: {{ getMemberName(song.member_id) }}</span>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <a 
                    v-if="song.link"
                    :href="song.link"
                    target="_blank"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Reference
                  </a>
                  <button
                    v-if="song.notes"
                    @click="showNotes(song)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    View Notes
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Draggable list for admin -->
          <template v-else>
            <TransitionGroup tag="div" name="list" class="mt-6 space-y-2">
              <div
                v-for="(song, index) in setlistSongs"
                :key="song.id"
                class="relative"
              >
                <!-- Drop indicator above -->
                <div
                  v-if="draggedItem !== null && draggedItem !== index && dropTarget === index"
                  class="absolute w-full h-2 -top-2 z-10"
                >
                  <div class="h-1 w-full bg-indigo-500 rounded-full transform translate-y-1/2"></div>
                </div>

                <div
                  class="bg-white border rounded-lg p-4 flex items-center space-x-4 cursor-move transition-all duration-200"
                  :class="{
                    'opacity-50': draggedItem === index,
                    'border-indigo-500': dropTarget === index && draggedItem !== index
                  }"
                  draggable="true"
                  @dragstart="dragStart($event, index)"
                  @dragend="dragEnd"
                  @dragover.prevent="dragOver($event, index)"
                  @dragenter.prevent="dragEnter(index)"
                  @dragleave.prevent="dragLeave(index)"
                  @drop.prevent="drop($event, index)"
                >
                  <!-- Drag Handle -->
                  <div class="handle text-gray-400">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  <div class="flex-none w-8 text-gray-500 font-medium">
                    {{ index + 1 }}.
                  </div>

                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900">{{ song.title }}</h4>
                    <p class="text-sm text-gray-500">{{ song.artist }}</p>
                    <div class="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Duration: {{ formatDuration(song.duration) }}</span>
                      <span>Added by: {{ getMemberName(song.member_id) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2">
                    <a 
                      v-if="song.link"
                      :href="song.link"
                      target="_blank"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Reference
                    </a>
                    <button
                      v-if="song.notes"
                      @click="showNotes(song)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      View Notes
                    </button>
                    <button
                      @click="removeFromSetlist(song)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </template>

          <!-- Total Duration -->
          <div class="mt-6 text-sm text-gray-500">
            Total Duration: {{ formatDuration(totalDuration) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import { useMembersStore } from '~/stores/members';
import type { Database } from '~/types/supabase';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const playlistStore = usePlaylistStore();
const membersStore = useMembersStore();
const { setlistSongs, isLoading, error } = storeToRefs(playlistStore);
const { members } = storeToRefs(membersStore);

// Get current user role
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const isAdmin = ref(false);

// Drag and drop state
const draggedItem = ref<number | null>(null);
const dropTarget = ref<number | null>(null);

// Check if current user is admin and load data
onMounted(async () => {
  if (user.value) {
    const { data } = await supabase
      .from('band_members')
      .select('role')
      .eq('id', user.value.id)
      .single();
    
    isAdmin.value = data?.role === 'admin';
  }
  
  await Promise.all([
    playlistStore.fetchSetlistSongs(),
    membersStore.fetchMembersWithPlaylists()
  ]);
});

// Format duration from PostgreSQL interval to readable format
function formatDuration(duration: string) {
  const [minutes, seconds] = duration.split(':');
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

// Calculate total duration
const totalDuration = computed(() => {
  let totalMinutes = 0;
  let totalSeconds = 0;

  setlistSongs.value.forEach(song => {
    const [minutes, seconds] = song.duration.split(':').map(Number);
    totalMinutes += minutes;
    totalSeconds += seconds;
  });

  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;

  return `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
});

// Get member name by ID
function getMemberName(memberId: string) {
  const member = members.value.find(m => m.id === memberId);
  return member?.username || 'Unknown Member';
}

// Drag and drop handlers
function dragStart(event: DragEvent, index: number) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    draggedItem.value = index;
  }
}

function dragEnd() {
  draggedItem.value = null;
  dropTarget.value = null;
}

function dragOver(event: DragEvent, index: number) {
  if (draggedItem.value === null || draggedItem.value === index) return;
  event.dataTransfer!.dropEffect = 'move';
}

function dragEnter(index: number) {
  if (draggedItem.value === null || draggedItem.value === index) return;
  dropTarget.value = index;
}

function dragLeave(index: number) {
  if (dropTarget.value === index) {
    dropTarget.value = null;
  }
}

async function drop(event: DragEvent, dropIndex: number) {
  event.stopPropagation();
  
  if (draggedItem.value === null || draggedItem.value === dropIndex) return;
  
  try {
    const items = [...setlistSongs.value];
    const [removed] = items.splice(draggedItem.value, 1);
    items.splice(dropIndex, 0, removed);
    
    // Update the setlist_order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      setlist_order: index + 1
    }));
    
    await playlistStore.updateSetlistOrder(updatedItems);
  } catch (e) {
    console.error('Error updating setlist order:', e);
  } finally {
    draggedItem.value = null;
    dropTarget.value = null;
  }
}

// Remove song from setlist
async function removeFromSetlist(song: PlaylistSong) {
  if (!isAdmin.value) return;
  
  try {
    await playlistStore.toggleSongInSetlist(song.id, false);
    await playlistStore.fetchSetlistSongs();
  } catch (e) {
    console.error('Error removing song from setlist:', e);
  }
}

// Show song notes in a dialog
function showNotes(song: PlaylistSong) {
  alert(song.notes);
}
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

/* Drop indicator animation */
@keyframes dropPulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>