// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Band Members table remains largely the same
      band_members: {
        Row: {
          id: string
          username: string
          full_name: string | null
          role: 'admin' | 'member'
          avatar_url: string | null  // Add this line
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['band_members']['Row'], 
          'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['band_members']['Insert']>
      }

      // Playlist Songs - Represents songs in members' personal playlists
      playlist_songs: {
        Row: {
          id: string
          member_id: string            // References band_members.id
          artist: string
          title: string
          duration: string             // Stored as interval
          link: string | null          // YouTube/Spotify link
          created_at: string
          updated_at: string
          notes: string | null         // Optional notes about the song
        }
        Insert: Omit<Database['public']['Tables']['playlist_songs']['Row'],
          'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['playlist_songs']['Insert']>
      }

      // Setlists - Admin-created performance lists
      setlists: {
        Row: {
          id: string
          name: string                 // e.g., "Summer Festival 2024"
          date: string | null          // Planned performance date
          created_by: string           // References band_members.id (admin only)
          created_at: string
          updated_at: string
          status: 'draft' | 'final'    // Setlist status
        }
        Insert: Omit<Database['public']['Tables']['setlists']['Row'],
          'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['setlists']['Insert']>
      }

      // Setlist Songs - Songs selected for performance
      setlist_songs: {
        Row: {
          id: string
          setlist_id: string           // References setlists.id
          playlist_song_id: string     // References playlist_songs.id
          position: number             // Order in the setlist
          created_at: string
          notes: string | null         // Performance-specific notes
        }
        Insert: Omit<Database['public']['Tables']['setlist_songs']['Row'],
          'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['setlist_songs']['Insert']>
      }
    }
  }
}