// composables/useSpotifyPreview.ts
import { ref } from 'vue';
import type { Database } from '~/types/supabase';
import { useAdmin } from '~/composables/useAdmin';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

export function useSpotifyPreview() {
  const isUpdatingPreview = ref(false);
  const supabase = useSupabaseClient<Database>();
  const { isAdmin, checkAdminStatus } = useAdmin(); // Add admin check

  // Check admin status when composable is used
  onMounted(async () => {
    await checkAdminStatus();
  });

  // Function to extract Spotify track ID from a link
  function extractSpotifyTrackId(link: string): string | null {
    const regex = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]{22})/;
    const match = link.match(regex);
    return match ? match[1] : null;
  }

  // Function to check if a link is from Spotify
  function isSpotifyLink(link: string | null): boolean {
    return link ? link.includes('spotify.com') : false;
  }

  // Function to fetch preview URL from our API and update the song
  async function fetchAndUpdatePreview(song: PlaylistSong): Promise<boolean> {
    // Security check - only allow admins to update preview URLs
    if (!isAdmin.value) {
      console.error('Only administrators can update preview URLs');
      return false;
    }
    
    if (!song.link || !isSpotifyLink(song.link)) return false;
    
    const trackId = extractSpotifyTrackId(song.link);
    if (!trackId) {
      console.error('Could not extract track ID from link:', song.link);
      return false;
    }
    
    try {
      isUpdatingPreview.value = true;
      
      // Fetch preview URL from our API
      const response = await fetch(`/api/spotify/get-preview?trackId=${trackId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.previewUrl) {
        console.warn('No preview URL found for track:', trackId);
        return false;
      }
      
      // Update the song in the database
      const { error } = await supabase
        .from('playlist_songs')
        .update({ preview_url: data.previewUrl })
        .eq('id', song.id);
      
      if (error) {
        throw error;
      }
      
      // Update the song in the local state
      song.preview_url = data.previewUrl;
      return true;
      
    } catch (error) {
      console.error('Error updating preview URL:', error);
      return false;
    } finally {
      isUpdatingPreview.value = false;
    }
  }

  return {
    isUpdatingPreview,
    isSpotifyLink,
    extractSpotifyTrackId,
    fetchAndUpdatePreview,
    isAdmin // Return admin status
  };
}