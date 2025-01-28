// stores/members.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

interface MemberWithPlaylist extends BandMember {
  playlist_songs: PlaylistSong[];
}

export const useMembersStore = defineStore('members', () => {
  // State to store all members and their playlists
  const members = ref<MemberWithPlaylist[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient<Database>();

  // Fetch all members with their playlists
  async function fetchMembersWithPlaylists() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('band_members')
        .select(`
          *,
          playlist_songs (*)
        `)
        .order('username');

      if (supabaseError) throw supabaseError;
      members.value = data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    members,
    isLoading,
    error,
    fetchMembersWithPlaylists
  };
});