<!-- layouts/default.vue -->
<template>
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <NuxtLink to="/" class="flex-shrink-0 flex items-center text-lg font-semibold text-indigo-600">
                Band Setlist Manager
              </NuxtLink>
  
              <div v-if="user" class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <!-- My Playlist - Available to all authenticated users -->
                <NuxtLink 
                  to="/my-playlist" 
                  class="nav-link"
                  :class="{ 'active-link': route.path === '/my-playlist' }"
                >
                  My Playlist
                </NuxtLink>
  
                <!-- All Playlists - Available to all authenticated users -->
                <NuxtLink 
                  to="/all-playlists" 
                  class="nav-link"
                  :class="{ 'active-link': route.path === '/all-playlists' }"
                >
                  All Playlists
                </NuxtLink>
  
                <!-- Setlist - Available to all users -->
                <NuxtLink 
                  to="/setlists" 
                  class="nav-link"
                  :class="{ 'active-link': route.path === '/setlists' }"
                >
                  {{ bandMember?.role === 'admin' ? 'Manage Setlist' : 'View Setlist' }}
                </NuxtLink>
              </div>
            </div>
  
            <!-- Right side - User menu -->
            <div v-if="user" class="flex items-center gap-4">
              <!-- User Profile Dropdown -->
              <div class="relative">
                <div class="flex items-center cursor-pointer" @click="isMenuOpen = !isMenuOpen">
                  <div class="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      v-if="bandMember?.avatar_url"
                      :src="bandMember.avatar_url"
                      :alt="bandMember?.username"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gray-200 flex items-center justify-center"
                    >
                      <span class="text-sm text-gray-500">
                        {{ bandMember?.username?.[0]?.toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <span class="ml-2 text-sm text-gray-500">
                    {{ bandMember?.username || user.email }}
                  </span>
                </div>
  
                <!-- Dropdown Menu -->
                <div v-if="isMenuOpen" 
                     class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <NuxtLink 
                    to="/profile" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="isMenuOpen = false"
                  >
                    Edit Profile
                  </NuxtLink>
                  <button 
                    @click="handleLogout" 
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
  
      <!-- Main Content Area -->
      <main>
        <slot />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import type { Database } from '~/types/supabase';
  
  // Get route for active link highlighting
  const route = useRoute();
  
  // Authentication and user management
  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  
  // State for dropdown menu
  const isMenuOpen = ref(false);
  
  // Store band member information including role
  const bandMember = ref<Database['public']['Tables']['band_members']['Row'] | null>(null);
  
  // Fetch band member details when user is authenticated
  watch(user, async (newUser) => {
    if (newUser) {
      const { data } = await supabase
        .from('band_members')
        .select('*')
        .eq('id', newUser.id)
        .single();
      
      bandMember.value = data;
    } else {
      bandMember.value = null;
    }
  }, { immediate: true });
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      isMenuOpen.value = false;
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Close dropdown when clicking outside
  onMounted(() => {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        isMenuOpen.value = false;
      }
    });
  });
  </script>
  
  <style scoped>
  .nav-link {
    @apply border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium;
  }
  
  .active-link {
    @apply border-indigo-500 text-gray-900;
  }
  </style>