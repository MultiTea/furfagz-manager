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
                  :member-name="getMemberName(song.member_id)"
                  @setlist-toggle="handleSetlistToggle"
                  @show-notes="showNotes"
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
import { useFormatDuration } from '~/composables/useFormatDuration';
import { useAdmin } from '~/composables/useAdmin';
import MemberHeader from '~/components/MemberHeader.vue';
import PlaylistSongItem from '~/components/PlaylistSongItem.vue';
import { LoadingState, ErrorState, EmptyState } from '~/components/ui';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

const membersStore = useMembersStore();
const playlistStore = usePlaylistStore();
const { members, isLoading, error } = storeToRefs(membersStore);

// Admin status
const { isAdmin, checkAdminStatus } = useAdmin();

const { formatDuration } = useFormatDuration();

// Get member name by ID
function getMemberName(memberId: string) {
  const member = members.value.find(m => m.id === memberId);
  return member?.username || 'Unknown Member';
}

// Handle setlist toggle
async function handleSetlistToggle(song: PlaylistSong) {
  if (!isAdmin.value) return;
  
  try {
    await playlistStore.toggleSongInSetlist(song.id, !song.is_in_setlist);
    // Refresh the members list to update the UI
    await membersStore.fetchMembersWithPlaylists();
  } catch (e) {
    console.error('Error toggling setlist status:', e);
  }
}

// Show song notes
function showNotes(song: PlaylistSong) {
  alert(song.notes);
}

// Load initial data
onMounted(async () => {
  await checkAdminStatus();
  await membersStore.fetchMembersWithPlaylists();
});
</script>