// middleware/profile.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware for login and profile pages
    if (to.path === '/login' || to.path === '/profile') {
      return;
    }
  
    const user = useSupabaseUser();
    const profileStore = useProfileStore();
  
    // If user is authenticated, check their profile
    if (user.value) {
      const profile = await profileStore.fetchProfile();
      
      // If no profile exists, redirect to profile creation
      if (!profile && to.path !== '/profile') {
        return navigateTo('/profile');
      }
    }
  });