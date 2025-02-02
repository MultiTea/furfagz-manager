// stores/members.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

interface MemberWithPlaylist extends BandMember {
  playlist_songs: PlaylistSong[];
}

export const useMembersStore = defineStore('members', () => {
  // State
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

  // Update member background color
  async function updateMemberBackgroundColor(memberId: string, color: string) {
    try {
      const { data, error: updateError } = await supabase
        .from('band_members')
        .update({ background_color: color })
        .eq('id', memberId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update the local state
      const memberIndex = members.value.findIndex(m => m.id === memberId);
      if (memberIndex !== -1 && data) {
        members.value[memberIndex] = {
          ...members.value[memberIndex],
          background_color: data.background_color
        };
      }

      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  return {
    members,
    isLoading,
    error,
    fetchMembersWithPlaylists,
    updateMemberBackgroundColor
  };
});