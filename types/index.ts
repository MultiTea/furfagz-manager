// types/index.ts

export interface BandMember {
    id: string;
    username: string;
    full_name: string | null;
    role: 'admin' | 'member';
    created_at: string;
    updated_at: string;
  }
  
  export interface Song {
    id: string;
    artist: string;
    title: string;
    duration: string; // This will be an interval from PostgreSQL
    link: string | null;
    added_by: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Setlist {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface SetlistSong {
    id: string;
    setlist_id: string;
    song_id: string;
    position: number;
    created_at: string;
  }