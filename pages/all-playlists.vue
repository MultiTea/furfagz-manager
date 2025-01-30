// pages/all-playlists.vue
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 sm:px-0">
      <h2 class="text-2xl font-semibold text-gray-900">Band Members' Playlists</h2>
      <p class="mt-1 text-sm text-gray-600">
        Review all song suggestions from band members. Each playlist shows songs that members would like to perform.
      </p>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="isLoading" class="mt-6" />

    <!-- Error State -->
    <ErrorState 
      v-else-if="error" 
      class="mt-6" 
      :message="error"
    />

    <!-- Content -->
    <div v-else class="mt-6 space-y-8">
      <!-- Member Playlist Cards -->
      <div 
        v-for="member in members" 
        :key="member.id" 
        class="bg-white shadow sm:rounded-lg overflow-hidden"
      >
        <MemberHeader 
          :member="member" 
          :playlist-count="member.playlist_songs.length"
        />
 <!-- Playlist Statistics -->
 <div class="px-4 py-3 bg-gray-50 border-t border-b border-gray-200">
          <div class="flex justify-between text-sm text-gray-600">
            <div class="space-x-4">
              <span>Playlist duration: {{ calculateTotalDuration(member.playlist_songs) }}</span>
            </div>
            <span>Selected: {{ getSelectedSongsCount(member.playlist_songs) }} ({{ calculateSelectedDuration(member.playlist_songs) }})</span>
          </div>
        </div>

        <!-- Playlist Content -->
        <div class="px-4 py-5 sm:p-6">
          <EmptyState 
            v-if="member.playlist_songs.length === 0"
            message="No songs added yet."
          />
          
          <div v-else class="flow-root">
            <ul role="list" class="-my-5 divide-y divide-gray-200">
              <li 
                v-for="song in member.playlist_songs" 
                :key="song.id" 
                class="py-4"
              >
                <PlaylistSongItem
                  :song="song"
                  :is-admin="isAdmin"
                  :added-by="getMemberName(song.member_id)"
                  @setlist-toggle="handleSetlistToggle"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMembersStore } from '~/stores/members';
import { usePlaylistStore } from '~/stores/playlist';
import type { Database } from '~/types/supabase';
import { useLoadingState } from '~/composables/useLoadingState';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import { useAdmin } from '~/composables/useAdmin';
import { useFormatDuration } from '~/composables/useFormatDuration';
import MemberHeader from '~/components/MemberHeader.vue';
import PlaylistSongItem from '~/components/PlaylistSongItem.vue';
import { LoadingState, ErrorState, EmptyState } from '~/components/ui';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { checkAuthAndRedirect } = useSupabaseAuth();
const { isAdmin, checkAdminStatus } = useAdmin();
const { formatDuration } = useFormatDuration();

// Stores
const membersStore = useMembersStore();
const playlistStore = usePlaylistStore();
const { members } = storeToRefs(membersStore);

// Get member name by ID
const getMemberName = (memberId: string) => {
  const member = members.value.find(m => m.id === memberId);
  return member?.username || 'Unknown Member';
};

// Calculate duration utilities
const calculateDurationSum = (durations: string[]): string => {
  let totalMinutes = 0;
  let totalSeconds = 0;

  durations.forEach(duration => {
    const [minutes, seconds] = duration.split(':').map(Number);
    totalMinutes += minutes;
    totalSeconds += seconds;
  });

  totalMinutes += Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;

  return `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
};

// Playlist statistics methods
const calculateTotalDuration = (songs: PlaylistSong[]) => {
  return formatDuration(
    calculateDurationSum(songs.map(song => song.duration))
  );
};

const calculateSelectedDuration = (songs: PlaylistSong[]) => {
  const selectedSongs = songs.filter(song => song.is_in_setlist);
  return formatDuration(
    calculateDurationSum(selectedSongs.map(song => song.duration))
  );
};

const getSelectedSongsCount = (songs: PlaylistSong[]) => {
  const count = songs.filter(song => song.is_in_setlist).length;
  return `${count} of ${songs.length} songs`;
};

// Handle setlist toggle
const handleSetlistToggle = async (song: PlaylistSong) => {
  if (!isAdmin.value) return;
  
  try {
    await playlistStore.toggleSongInSetlist(song.id, !song.is_in_setlist);
    // Refresh the members list to update the UI
    await membersStore.fetchMembersWithPlaylists();
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
};

// Initialize data
onMounted(async () => {
  if (checkAuthAndRedirect()) {
    await withLoading(async () => {
      await Promise.all([
        checkAdminStatus(),
        membersStore.fetchMembersWithPlaylists()
      ]);
    });
  }
});
</script>