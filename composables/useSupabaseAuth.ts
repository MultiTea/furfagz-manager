// composables/useSupabaseAuth.ts
import type { Database } from '~/types/supabase';

export function useSupabaseAuth() {
    const user = useSupabaseUser();
    const supabase = useSupabaseClient<Database>();
    const router = useRouter();
  
    const isAuthenticated = computed(() => !!user.value);
  
    const checkAuthAndRedirect = () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return false;
      }
      return true;
    };
  
    const getCurrentUserId = (): string => {
      if (!user.value?.id) {
        throw new Error('User must be authenticated');
      }
      return user.value.id;
    };
  
    return {
      user,
      supabase,
      isAuthenticated,
      checkAuthAndRedirect,
      getCurrentUserId
    };
  }
  