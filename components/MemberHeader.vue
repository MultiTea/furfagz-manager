// components/MemberHeader.vue
<template>
  <div class="px-4 py-5 sm:px-6 bg-gray-50">
    <div class="flex items-center space-x-4">
      <!-- Profile Image -->
      <div class="w-12 h-12 rounded-full overflow-hidden">
        <img
          v-if="member.avatar_url"
          :src="member.avatar_url"
          :alt="member.username"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gray-200 flex items-center justify-center"
        >
          <span class="text-gray-500 text-lg">
            {{ member.username?.[0]?.toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Member Info -->
      <div>
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {{ member.username }}'s Playlist
          <span class="ml-2 text-sm text-gray-500">({{ playlistCount }} songs)</span>
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ member.band_role }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase';

type BandMember = Database['public']['Tables']['band_members']['Row'];

defineProps<{
  member: BandMember
  playlistCount: number
}>();
</script>