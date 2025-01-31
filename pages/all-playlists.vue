<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 sm:px-0">
      <h2 class="text-2xl font-semibold text-gray-900">Band Members' Playlists</h2>
      <p class="mt-1 text-sm text-gray-600">
        Review all song suggestions from band members. Each playlist shows songs that members would like to perform.
      </p>
    </div>

    <LoadingState v-if="isLoading" class="mt-6" />
    <ErrorState v-else-if="error" class="mt-6" :message="error" />

    <div v-else class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        v-for="member in members" 
        :key="member.id" 
        class="bg-white shadow sm:rounded-lg overflow-hidden flex flex-col"
      >
        <MemberHeader :member="member" :selected-count="getSelectedSongsCount(member.playlist_songs)" />

        <div class="px-4 py-5 sm:p-6 flex-grow">
          <EmptyState v-if="member.playlist_songs.length === 0" message="No songs added yet." />
          
          <div v-else class="space-y-4">
            <PlaylistSongItem
              v-for="song in sortedSongs(member.playlist_songs)"
              :key="song.id"
              :song="song"
              :is-admin="isAdmin"
              :added-by="getMemberName(song.member_id)"
              @setlist-toggle="handleSetlistToggle"
            />
          </div>
        </div>

        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between text-sm text-gray-600">
            <span>Total: {{ calculateTotalDuration(member.playlist_songs) }}</span>
            <span>Selected: {{ calculateSelectedDuration(member.playlist_songs) }}</span>
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
import { LoadingState, ErrorState, EmptyState } from '~/components/ui';
import MemberHeader from '~/components/MemberHeader.vue';
import PlaylistSongItem from '~/components/PlaylistSongItem.vue';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const { isLoading, error, withLoading } = useLoadingState();
const { checkAuthAndRedirect } = useSupabaseAuth();
const { isAdmin, checkAdminStatus } = useAdmin();

const playlistStore = usePlaylistStore();
const membersStore = useMembersStore();
const { members } = storeToRefs(membersStore);

function getMemberName(memberId: string) {
  const member = members.value.find(m => m.id === memberId);
  return member?.username || 'Unknown Member';
}

// Sort songs alphabetically by artist name
const sortedSongs = (songs: PlaylistSong[]) => {
  return [...songs].sort((a, b) => a.artist.localeCompare(b.artist));
};

const calculateDurationSum = (durations: string[]): string => {
  let totalSeconds = 0;
  durations.forEach(duration => {
    const [minutes = "0", seconds = "0"] = duration.split(':');
    totalSeconds += parseInt(minutes) * 60 + parseInt(seconds);
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const calculateTotalDuration = (songs: PlaylistSong[]) => 
  calculateDurationSum(songs.map(song => song.duration));

const calculateSelectedDuration = (songs: PlaylistSong[]) => 
  calculateDurationSum(songs.filter(song => song.is_in_setlist).map(song => song.duration));

const getSelectedSongsCount = (songs: PlaylistSong[]) => {
  const count = songs.filter(song => song.is_in_setlist).length;
  return `${count} of ${songs.length}`;
};

const handleSetlistToggle = async (song: PlaylistSong) => {
  if (!isAdmin.value) return;
  
  try {
    await playlistStore.toggleSongInSetlist(song.id, !song.is_in_setlist);
    await membersStore.fetchMembersWithPlaylists();
  } catch (e: unknown) {
    if (e instanceof Error) error.value = e.message;
  }
};

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