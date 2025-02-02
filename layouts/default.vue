# layouts/default.vue
<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Mobile menu button -->
            <button 
              type="button"
              @click="isMobileMenuOpen = !isMobileMenuOpen" 
              class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span class="sr-only">Open main menu</span>
              <!-- Icon when menu is closed -->
              <svg 
                v-if="!isMobileMenuOpen" 
                class="block h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Icon when menu is open -->
              <svg 
                v-else 
                class="block h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <NuxtLink to="/" class="flex-shrink-0 flex items-center text-lg font-semibold text-indigo-600 ml-2 sm:ml-0">
              Furfagz Manager
            </NuxtLink>

            <!-- Desktop Navigation -->
            <div v-if="user" class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink 
                to="/my-playlist" 
                class="nav-link"
                :class="{ 'active-link': route.path === '/my-playlist' }"
              >
                My Playlist
              </NuxtLink>
              
              <NuxtLink 
                to="/all-playlists" 
                class="nav-link"
                :class="{ 'active-link': route.path === '/all-playlists' }"
              >
                All Playlists
              </NuxtLink>
              
              <NuxtLink 
                to="/setlists" 
                class="nav-link"
                :class="{ 'active-link': route.path === '/setlists' }"
              >
                {{ bandMember?.role === 'admin' ? 'Manage Setlist' : 'View Setlist' }}
              </NuxtLink>
            </div>
          </div>

          <!-- User Menu -->
          <div v-if="user" class="flex items-center">
            <div class="relative">
              <div class="flex items-center cursor-pointer" @click="isProfileMenuOpen = !isProfileMenuOpen">
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
                <span class="ml-2 text-sm text-gray-500 hidden sm:block">
                  {{ bandMember?.username }}
                </span>
              </div>

              <!-- Profile Dropdown -->
              <div v-if="isProfileMenuOpen" 
                   class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <NuxtLink 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="isProfileMenuOpen = false"
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

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div 
          v-if="isMobileMenuOpen && user" 
          class="sm:hidden bg-white border-t border-gray-200"
        >
          <div class="pt-2 pb-3 space-y-1">
            <NuxtLink
              to="/my-playlist"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-indigo-50 text-indigo-700': route.path === '/my-playlist' }"
              @click="isMobileMenuOpen = false"
            >
              My Playlist
            </NuxtLink>

            <NuxtLink
              to="/all-playlists"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-indigo-50 text-indigo-700': route.path === '/all-playlists' }"
              @click="isMobileMenuOpen = false"
            >
              All Playlists
            </NuxtLink>

            <NuxtLink
              to="/setlists"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-indigo-50 text-indigo-700': route.path === '/setlists' }"
              @click="isMobileMenuOpen = false"
            >
              {{ bandMember?.role === 'admin' ? 'Manage Setlist' : 'View Setlist' }}
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main Content Area -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Database } from '~/types/supabase';

const route = useRoute();

const user = useSupabaseUser();
const supabase = useSupabaseClient<Database>();
const router = useRouter();

const isProfileMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const bandMember = ref<Database['public']['Tables']['band_members']['Row'] | null>(null);

// Fetch band member details
async function fetchBandMember() {
  if (user.value) {
    const { data } = await supabase
      .from('band_members')
      .select('*')
      .eq('id', user.value.id)
      .single();
    
    bandMember.value = data;
  } else {
    bandMember.value = null;
  }
}

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await fetchBandMember();
  } else {
    bandMember.value = null;
  }
}, { immediate: true });

// Watch for route changes to refresh member data
// This ensures we have fresh data after profile updates
watch(route, async () => {
  if (user.value) {
    await fetchBandMember();
  }
});

// Handle user logout
const handleLogout = async () => {
  try {
    isProfileMenuOpen.value = false;
    isMobileMenuOpen.value = false;
    await supabase.auth.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Watch route changes to close mobile menu
watch(route, () => {
  isMobileMenuOpen.value = false;
});

// Handle clicks outside menus
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative') && !target.closest('button')) {
      isProfileMenuOpen.value = false;
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