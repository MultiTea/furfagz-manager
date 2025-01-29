// middleware/spotify.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware for certain routes
    if (to.path === '/login' || to.path.startsWith('/api/spotify')) {
      return
    }
  
    const { tokenData } = useSpotifyAuth()
  
    // If no token data exists, start Spotify auth flow
    if (!tokenData.value) {
      const config = useRuntimeConfig()
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.public.spotifyClientId,
        redirect_uri: `http://localhost:3000/api/spotify/callback`, // Hardcode for development
        scope: [
          'user-read-email',
          'user-read-private',
          'playlist-read-private',
          'playlist-read-collaborative',
          'playlist-modify-public',
          'playlist-modify-private'
        ].join(' ')
      })
  
      // Redirect to Spotify auth page with external option set to true
      return navigateTo(
        `https://accounts.spotify.com/authorize?${params.toString()}`,
        { external: true }
      )
    }
  })