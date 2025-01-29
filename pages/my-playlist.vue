// pages/my-playlist.vue
<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <BaseCard
      title="My Song Suggestions"
      description="Add songs you'd like to perform. The admin will review these when creating setlists."
    >
      <SongForm @added="handleSongAdded" />

      <!-- Loading State -->
      <LoadingState v-if="isLoading" class="mt-6" />

      <!-- Empty State -->
      <EmptyState 
        v-else-if="songs.length === 0" 
        class="mt-6"
        message="No songs in your playlist yet. Add your first suggestion above!"
      />

      <!-- Song List -->
      <ul v-else role="list" class="mt-6 divide-y divide-gray-200">
        <li v-for="song in songs" :key="song.id" class="py-4">
          <SongListItem
            :song="song"
            :show-actions="true"
            @edit="editSong"
            @delete="confirmDelete"
          />
        </li>
      </ul>

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