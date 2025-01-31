// middleware/auth.global.ts
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
        .maybeSingle(); // Use maybeSingle instead of single to avoid error

      // If there was a real error (not just no rows found)
      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error checking band member:', memberError);
        return navigateTo('/login');
      }

      // If user doesn't exist in band_members, create them
      if (!memberData) {
        console.log('Creating new band member for user:', user.value.id);
        const { error: insertError } = await supabase
          .from('band_members')
          .insert({
            id: user.value.id,
            username: user.value.email?.split('@')[0] || 'New Member',
            role: 'member',
            band_role: 'New Member'
          });

        if (insertError) {
          console.error('Error creating band member:', insertError);
          return navigateTo('/login');
        }

        // After creating the user, redirect to profile page to complete setup
        if (to.path !== '/profile') {
          return navigateTo('/profile');
        }
      }
    } catch (error) {
      console.error('Unexpected error in auth middleware:', error);
      return navigateTo('/login');
    }
  }

  // If user is not authenticated and tries to access a protected route
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  // If user is authenticated but on login page, redirect to home
  if (user.value && to.path === '/login') {
    return navigateTo('/');
  }
});