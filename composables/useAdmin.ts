// composables/useAdmin.ts
import { ref } from 'vue';

// Singleton pattern to avoid multiple checks
let isAdminChecked = false;
const isAdmin = ref(false);

export function useAdmin() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  async function checkAdminStatus() {
    // If we've already checked, return the stored value
    if (isAdminChecked) {
      return isAdmin.value;
    }
    
    // If no user is logged in, they can't be admin
    if (!user.value) {
      isAdmin.value = false;
      isAdminChecked = true;
      return false;
    }
    
    try {
      const { data } = await supabase
        .from('band_members')
        .select('role')
        .eq('id', user.value.id)
        .single();
      
      isAdmin.value = data?.role === 'admin';
      isAdminChecked = true;
      return isAdmin.value;
    } catch (error) {
      // On error, assume not admin
      isAdmin.value = false;
      return false;
    }
  }
  
  // Reset the check when user changes
  watch(() => user.value?.id, () => {
    isAdminChecked = false;
  });

  return {
    isAdmin,
    checkAdminStatus
  };
}