// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    // This is important for GitHub Pages deployment
    baseURL: '/band-setlist-manager/',
    buildAssetsDir: 'assets'
  },
  typescript: {
    strict: true
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: true
  },
  // Runtime config
  runtimeConfig: {
    // Private keys are only available on the server
    spotifyClientSecret: process.env.NUXT_SPOTIFY_CLIENT_SECRET,
    
    // Public keys that are available on both client and server
    public: {
      spotifyClientId: process.env.NUXT_SPOTIFY_CLIENT_ID,
      youtubeApiKey: process.env.NUXT_YOUTUBE_API_KEY,
      spotifyAccessToken: process.env.NUXT_SPOTIFY_ACCESS_TOKEN
    }
  },})