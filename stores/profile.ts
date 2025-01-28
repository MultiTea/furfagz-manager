// stores/profile.ts
import { defineStore } from 'pinia';
import type { Database } from '~/types/supabase';

type BandMember = Database['public']['Tables']['band_members']['Row'];
type InsertBandMember = Database['public']['Tables']['band_members']['Insert'];
type UpdateBandMember = Database['public']['Tables']['band_members']['Update'];

export const useProfileStore = defineStore('profile', () => {
  // State to hold the current user's profile information
  const profile = ref<BandMember | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  // Fetch the current user's profile from the band_members table
  async function fetchProfile() {
    if (!user.value) return null;
    
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('band_members')
        .select('*')
        .eq('id', user.value.id)
        .single();

      if (supabaseError) throw supabaseError;
      profile.value = data;
      return data;
    } catch (e: any) {
      error.value = e.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  // Create or update a user's profile
  async function upsertProfile(profileData: Omit<InsertBandMember, 'id'>) {
    if (!user.value) throw new Error('User must be authenticated');
    
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('band_members')
        .upsert({
          id: user.value.id,
          ...profileData
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      profile.value = data;
      return data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Check if the current user has completed their profile
  const hasProfile = computed(() => !!profile.value);

  return {
    profile,
    isLoading,
    error,
    hasProfile,
    fetchProfile,
    upsertProfile
  };
});