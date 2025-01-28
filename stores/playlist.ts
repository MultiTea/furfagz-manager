// stores/playlist.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

// These type definitions help us ensure type safety throughout our application
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];
type InsertPlaylistSong = Database['public']['Tables']['playlist_songs']['Insert'];
type UpdatePlaylistSong = Database['public']['Tables']['playlist_songs']['Update'];

export const usePlaylistStore = defineStore('playlist', () => {
  // State management using refs for reactivity
  const songs = ref<PlaylistSong[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get Supabase client and current user
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
      // Prepare the song data according to our database schema
      const insertData: InsertPlaylistSong = {
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

  // Update an existing song in the playlist
  async function updateSong(id: string, updates: UpdatePlaylistSong) {
    if (!user.value) throw new Error('User must be authenticated to update songs');

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('playlist_songs')
        .update(updates)
        .eq('id', id)
        .eq('member_id', user.value.id) // Ensure user owns the song
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      if (data) {
        // Update the song in our local state
        const index = songs.value.findIndex(song => song.id === id);
        if (index !== -1) {
          songs.value[index] = data;
        }
      }
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete a song from the playlist
  async function deleteSong(id: string) {
    if (!user.value) throw new Error('User must be authenticated to delete songs');

    isLoading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('id', id)
        .eq('member_id', user.value.id); // Ensure user owns the song

      if (supabaseError) throw supabaseError;
      
      // Remove the song from our local state
      songs.value = songs.value.filter(song => song.id !== id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Return the store's public interface
  return {
    songs,
    isLoading,
    error,
    fetchMyPlaylist,
    addSong,
    updateSong,
    deleteSong
  };
});