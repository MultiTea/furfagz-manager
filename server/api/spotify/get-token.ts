// server/api/spotify/get-token.ts
export default defineEventHandler(async () => {
    const config = useRuntimeConfig();
  
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: config.public.spotifyClientId,
          client_secret: config.spotifyClientSecret,
        }),
      });
  
      if (!response.ok) {
        throw createError({
          statusCode: response.status,
          statusMessage: 'Failed to get Spotify token'
        });
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      throw error;
    }
  });