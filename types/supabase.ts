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
          full_name: string | null
          role: 'admin' | 'member'
          avatar_url: string | null
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
        }
        Insert: Omit<Database['public']['Tables']['playlist_songs']['Row'],
          'id' | 'created_at' | 'updated_at' | 'is_in_setlist' | 'setlist_order'>
        Update: Partial<Database['public']['Tables']['playlist_songs']['Row']>
      }
    }
  }
}