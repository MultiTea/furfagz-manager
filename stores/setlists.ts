// stores/setlists.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

type Setlist = Database['public']['Tables']['setlists']['Row'];
type SetlistSong = Database['public']['Tables']['setlist_songs']['Row'];
type InsertSetlist = Database['public']['Tables']['setlists']['Insert'];
type InsertSetlistSong = Database['public']['Tables']['setlist_songs']['Insert'];

export const useSetlistsStore = defineStore('setlists', () => {
  // State for managing setlists and their songs
  const setlists = ref<Setlist[]>([]);
  const currentSetlist = ref<(Setlist & { songs: SetlistSong[] }) | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  // Fetch all setlists
  async function fetchSetlists() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('setlists')
        .select(`
          *,
          setlist_songs (
            *,
            songs (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setlists.value = data || [];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }

  // Create a new setlist
  async function createSetlist(name: string) {
    if (!user.value) throw new Error('User must be authenticated');
    
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('setlists')
        .insert({
          name,
          created_by: user.value.id
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      if (data) {
        setlists.value = [data, ...setlists.value];
      }
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Add songs to a setlist
  async function addSongToSetlist(setlistId: string, songId: string, position: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('setlist_songs')
        .insert({
          setlist_id: setlistId,
          song_id: songId,
          position
        })
        .select(`
          *,
          songs (*)
        `)
        .single();

      if (supabaseError) throw supabaseError;
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    setlists,
    currentSetlist,
    isLoading,
    error,
    fetchSetlists,
    createSetlist,
    addSongToSetlist
  };
});