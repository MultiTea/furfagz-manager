// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser();
    const { auth } = useSupabaseClient();
  
    // Check if user is authenticated
    if (!user.value && to.path !== '/login') {
      return navigateTo('/login');
    }
  
    // If user is authenticated but on login page, redirect to home
    if (user.value && to.path === '/login') {
      return navigateTo('/');
    }
  });