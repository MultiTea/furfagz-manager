export function useAdmin() {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const isAdmin = ref(false);
  
    async function checkAdminStatus() {
      if (!user.value) return false;
      
      const { data } = await supabase
        .from('band_members')
        .select('role')
        .eq('id', user.value.id)
        .single();
      
      isAdmin.value = data?.role === 'admin';
      return isAdmin.value;
    }
  
    return {
      isAdmin,
      checkAdminStatus
    };
  }