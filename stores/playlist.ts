// stores/playlist.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

export const usePlaylistStore = defineStore('playlist', () => {
  const songs = ref<PlaylistSong[]>([]);
  const setlistSongs = ref<PlaylistSong[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  // Fetch all songs in the user's playlist
  async function fetchMyPlaylist() {
    if (!user.value) {
      error.value = 'User must be authenticated to fetch playlist';
      return;
    }
    
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('member_id', user.value.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      songs.value = data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Fetch setlist songs
  async function fetchSetlistSongs() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('is_in_setlist', true)
        .order('setlist_order', { ascending: true });

      if (supabaseError) throw supabaseError;
      setlistSongs.value = data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Toggle song in setlist
  async function toggleSongInSetlist(songId: string, isInSetlist: boolean) {
    try {
      const maxOrderQuery = await supabase
        .from('playlist_songs')
        .select('setlist_order')
        .eq('is_in_setlist', true)
        .order('setlist_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = maxOrderQuery.data?.setlist_order 
        ? maxOrderQuery.data.setlist_order + 1 
        : 1;

      const { error: updateError } = await supabase
        .from('playlist_songs')
        .update({ 
          is_in_setlist: isInSetlist,
          setlist_order: isInSetlist ? nextOrder : null 
        })
        .eq('id', songId);

      if (updateError) throw updateError;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Update setlist order
  async function updateSetlistOrder(songs: PlaylistSong[]) {
    try {
      // Update each song's order in a transaction or batch
      for (let i = 0; i < songs.length; i++) {
        const { error: updateError } = await supabase
          .from('playlist_songs')
          .update({ setlist_order: i + 1 })
          .eq('id', songs[i].id);

        if (updateError) throw updateError;
      }
      
      // Update local state
      setlistSongs.value = songs;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Add a new song to the user's playlist
  async function addSong(songData: {
    artist: string;
    title: string;
    duration: string;
    link?: string | null;
    notes?: string | null;
  }) {
    if (!user.value) {
      throw new Error('User must be authenticated to add songs');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const insertData = {
        member_id: user.value.id,
        artist: songData.artist,
        title: songData.title,
        duration: songData.duration,
        link: songData.link || null,
        notes: songData.notes || null
      };

      const { data, error: supabaseError } = await supabase
        .from('playlist_songs')
        .insert([insertData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      if (data) {
        // Add the new song to the beginning of our local songs array
        songs.value = [data, ...songs.value];
      }
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    songs,
    setlistSongs,
    isLoading,
    error,
    fetchMyPlaylist,
    fetchSetlistSongs,
    toggleSongInSetlist,
    updateSetlistOrder,
    addSong
  };
});