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
        band_members: {
          Row: {
            id: string
            username: string
            band_role: string
            role: 'admin' | 'member'
            avatar_url: string | null
            spotify_playlist: string | null
            youtube_playlist: string | null
            created_at: string
            updated_at: string
          }
          Insert: Omit<Database['public']['Tables']['band_members']['Row'], 
            'created_at' | 'updated_at'>
          Update: Partial<Database['public']['Tables']['band_members']['Insert']>
        }

      playlist_songs: {
        Row: {
          id: string
          member_id: string
          artist: string
          title: string
          duration: string
          link: string | null
          created_at: string
          updated_at: string
          notes: string | null
          is_in_setlist: boolean
          setlist_order: number | null
          thumbnail_url: string | null  // Add this new field
        }
        Insert: Omit<Database['public']['Tables']['playlist_songs']['Row'],
          'id' | 'created_at' | 'updated_at' | 'is_in_setlist' | 'setlist_order'>
        Update: Partial<Database['public']['Tables']['playlist_songs']['Row']>
      }
    }
  }
}