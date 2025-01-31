// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // Remove the baseURL and buildAssetsDir since we're deploying to Netlify
  app: {
    head: {
      title: 'Furfagz Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  // Update Tailwind configuration
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    exposeConfig: false,
    viewer: true
  },

  typescript: {
    strict: true
  },

  // Add Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
    }
  },

  runtimeConfig: {
    // Private keys are only available on the server
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    
    // Public keys that are available on both client and server
    public: {
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
      youtubeApiKey: process.env.YOUTUBE_API_KEY,
    }
  },

  compatibilityDate: '2025-01-31',
})