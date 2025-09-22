// pages/my-playlist.vue
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <BaseCard
      title="My Song Suggestions"
      description="Add songs of your choice you'd like to perform on stage."
    >
      <!-- <SongForm @added="handleSongAdded" /> -->

      <!-- Loading State -->
      <LoadingState v-if="isLoading" class="mt-6" />

      <!-- Empty State -->
      <EmptyState 
        v-else-if="songs.length === 0" 
        class="mt-6"
        message="No songs in your playlist yet. Add your first suggestion above!"
      />

      <!-- Song List -->
      <div v-else class="mt-6 space-y-4">
        <SongListItem
          v-for="song in songs"
          :key="song.id"
          :song="song"
          :is-admin="true"
        >
          <template #actions>
            <div class="flex items-center space-x-2">
              <button
                @click="editSong(song)"
                class="text-indigo-600 hover:text-indigo-500"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(song)"
                class="text-red-600 hover:text-red-500"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </template>
        </SongListItem>
      </div>

      <!-- Edit Song Modal -->
      <Modal v-if="showEditModal" @close="showEditModal = false">
        <template #title>Edit Song</template>
        <form @submit.prevent="handleEditSubmit" class="space-y-4">
          <BaseInput
            v-model="editForm.title"
            id="edit-title"
            label="Title"
            required
          />

          <BaseInput
            v-model="editForm.artist"
            id="edit-artist"
            label="Artist"
            required
          />

          <BaseInput
            v-model="editForm.link"
            id="edit-link"
            label="Link"
            type="url"
          />

          <div>
            <label for="edit-notes" class="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="edit-notes"
              v-model="editForm.notes"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <BaseButton
              variant="secondary"
              text="Cancel"
              @click="showEditModal = false"
            />
            <BaseButton
              type="submit"
              text="Save Changes"
              :is-loading="isLoading"
            />
          </div>
        </form>
      </Modal>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePlaylistStore } from '~/stores/playlist';
import type { Database } from '~/types/supabase';
import { useLoadingState } from '~/composables/useLoadingState';
import { useFormValidation } from '~/composables/useFormValidation';
import { useSupabaseAuth } from '~/composables/useSupabaseAuth';
import SongForm from '~/components/SongForm.vue';
import SongListItem from '~/components/SongListItem.vue';
import {
  BaseButton,
  BaseCard,
  BaseInput,
  LoadingState,
  EmptyState,
  Modal
} from '~/components/ui';

type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

// Composables
const { isLoading, error, withLoading } = useLoadingState();
const { validateForm, errors } = useFormValidation();
const { checkAuthAndRedirect } = useSupabaseAuth();

// Store
const store = usePlaylistStore();
const { songs } = storeToRefs(store);

// Edit modal state
const showEditModal = ref(false);
const editForm = ref<{
  id: string;
  title: string;
  artist: string;
  link: string | null;
  notes: string | null;
  thumbnail_url: string | null;
}>({
  id: '',
  title: '',
  artist: '',
  link: null,
  notes: null,
  thumbnail_url: null
});

// Validation rules
const editValidationRules = {
  title: [{ validate: (v: string) => !!v.trim(), message: 'Title is required' }],
  artist: [{ validate: (v: string) => !!v.trim(), message: 'Artist is required' }],
};

// Lifecycle
onMounted(async () => {
  if (checkAuthAndRedirect()) {
    await withLoading(async () => {
      await store.fetchMyPlaylist();
    });
  }
});

// Methods
const handleSongAdded = async () => {
  await withLoading(async () => {
    await store.fetchMyPlaylist();
  });
};

const editSong = (song: PlaylistSong) => {
  editForm.value = { ...song };
  showEditModal.value = true;
};

const handleEditSubmit = async () => {
  if (!validateForm(editForm.value, editValidationRules)) {
    return;
  }

  try {
    await withLoading(async () => {
      await store.updateSong(editForm.value.id, {
        title: editForm.value.title,
        artist: editForm.value.artist,
        link: editForm.value.link,
        notes: editForm.value.notes,
        thumbnail_url: editForm.value.thumbnail_url
      });
      
      showEditModal.value = false;
      await store.fetchMyPlaylist();
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
};

const confirmDelete = async (song: PlaylistSong) => {
  if (!confirm(`Are you sure you want to remove "${song.title}" from your playlist?`)) {
    return;
  }

  try {
    await withLoading(async () => {
      await store.deleteSong(song.id);
      await store.fetchMyPlaylist();
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  }
};
</script>