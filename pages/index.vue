// pages/index.vue
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Band Setlist Manager</h1>
        
        <!-- Authenticated User View -->
        <div v-if="isAuthenticated" class="space-y-6">
          <p class="text-gray-600">
            Welcome {{ userDisplayName }}!
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <!-- Personal Playlist Card -->
            <DashboardCard 
              title="My Playlist"
              description="Manage your personal song suggestions for the band."
              to="/my-playlist"
              :color-scheme="cardColors.indigo"
              button-text="View My Playlist"
            />
            
            <!-- All Playlists Card -->
            <DashboardCard
              title="All Playlists"
              description="Explore song suggestions from all band members."
              to="/all-playlists"
              :color-scheme="cardColors.emerald"
              button-text="View All Playlists"
            />
            
            <!-- Setlist Card -->
            <DashboardCard
              :title="isAdmin ? 'Manage Setlist' : 'View Setlist'"
              :description="isAdmin 
                ? 'Create and manage the band setlist.' 
                : 'Check out the current band setlist.'"
              to="/setlists"
              :color-scheme="cardColors.purple"
              :button-text="isAdmin ? 'Manage Setlist' : 'View Setlist'"
            />
          </div>
        </div>

        <!-- Guest View -->
        <div v-else class="text-center">
          <p class="text-gray-600 mb-4">Please log in to access the band setlist manager.</p>
          <NuxtLink
            to="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { Database } from '~/types/supabase';
import { useLoadingState } from '~/composables/useLoadingState';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import { useAdmin } from '~/composables/useAdmin';

// Types
type BandMember = Database['public']['Tables']['band_members']['Row'];

// Card color schemes
const cardColors = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    description: 'text-indigo-600',
    button: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    description: 'text-emerald-600',
    button: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    description: 'text-purple-600',
    button: 'bg-purple-600',
    hover: 'hover:bg-purple-700'
  }
} as const;

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { isAuthenticated, user } = useSupabaseAuth();
const { isAdmin, checkAdminStatus } = useAdmin();

// Band member state
const bandMember = ref<BandMember | null>(null);

// Computed
const userDisplayName = computed(() => {
  return bandMember.value?.username || user.value?.email || '';
});

// Initialize admin status and fetch member details
onMounted(async () => {
  if (isAuthenticated.value) {
    await withLoading(async () => {
      await checkAdminStatus();
      const { data } = await useSupabaseClient()
        .from('band_members')
        .select('*')
        .eq('id', user.value?.id)
        .single();
      
      bandMember.value = data;
    });
  }
});

const route = useRoute()
const { storeTokenData } = useSpotifyAuth()

// Handle tokens passed in URL
onMounted(() => {
  const token = route.query.token as string
  const refreshToken = route.query.refresh_token as string
  const expiresIn = parseInt(route.query.expires_in as string)

  if (token && refreshToken && expiresIn) {
    storeTokenData({
      access_token: token,
      refresh_token: refreshToken,
      expires_in: expiresIn
    })

    // Clean up URL
    navigateTo('/', { replace: true })
  }
})
</script>