// stores/songs.ts

// Import necessary dependencies and types
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

// Create type aliases for better readability and maintainability
// These types are derived from our Database type which matches our Supabase schema
type Song = Database['public']['Tables']['songs']['Row'];
type InsertSong = Database['public']['Tables']['songs']['Insert'];
type UpdateSong = Database['public']['Tables']['songs']['Update'];

// Define our store using the composition API style
export const useSongsStore = defineStore('songs', () => {
  // State management using refs for reactivity
  // We explicitly type our refs to ensure type safety
  const songs = ref<Song[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get Supabase client and user state using Nuxt composables
  // The Database type parameter ensures type safety in our queries
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  // Fetch all songs from the database
  // This is used when initially loading the page or refreshing the song list
  async function fetchSongs() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      songs.value = data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Add a new song to the database
  // The songData parameter excludes 'added_by' as it's set automatically
  async function addSong(songData: Omit<InsertSong, 'added_by'>) {
    isLoading.value = true;
    error.value = null;

    try {
      // Verify user authentication before proceeding
      if (!user.value) {
        throw new Error('User must be authenticated to add songs');
      }

      const { data, error: supabaseError } = await supabase
        .from('songs')
        .insert([{
          ...songData,
          added_by: user.value.id
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      // Update local state with the new song if successful
      if (data) {
        songs.value = [data, ...songs.value];
      }
    } catch (e: any) {
      error.value = e.message;
      throw e; // Rethrow to handle in the component
    } finally {
      isLoading.value = false;
    }
  }

  // Update an existing song
  // Only the owner of the song can update it (enforced by RLS)
  async function updateSong(id: string, updates: UpdateSong) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('songs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      // Update the song in the local state if successful
      if (data) {
        const index = songs.value.findIndex(song => song.id === id);
        if (index !== -1) {
          songs.value[index] = data;
        }
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete a song from the database
  // Only the owner of the song can delete it (enforced by RLS)
  async function deleteSong(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: supabaseError } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      // Remove the song from local state if successful
      songs.value = songs.value.filter(song => song.id !== id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Computed property to filter songs belonging to the current user
  // This is used in the UI to show only the user's songs
  const mySongs = computed(() => {
    return songs.value.filter(song => song.added_by === user.value?.id);
  });

  // Return all the state and methods that should be accessible from components
  return {
    // State
    songs,
    mySongs,
    isLoading,
    error,
    // Methods
    fetchSongs,
    addSong,
    updateSong,
    deleteSong
  };
});