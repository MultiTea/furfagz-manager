export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser();
    const supabase = useSupabaseClient();
    
    // If user is authenticated and trying to access a protected route
    if (user.value && to.path !== '/login') {
      try {
        // Check if user exists in band_members table
        const { data: memberData, error: memberError } = await supabase
          .from('band_members')
          .select('id')
          .eq('id', user.value.id)
          .single();
  
        // If user doesn't exist in band_members, add them
        if (!memberData && !memberError) {
          const { error: insertError } = await supabase
            .from('band_members')
            .insert({
              id: user.value.id,
              username: user.value.email,
              full_name: user.value.user_metadata?.full_name || null,
              role: 'member'
            });
  
          if (insertError) {
            console.error('Error creating band member:', insertError);
            return navigateTo('/login');
          }
        }
      } catch (error) {
        console.error('Error checking band member:', error);
        return navigateTo('/login');
      }
    }
  });