// components/ProfileImageUpload.vue
<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-4">
      <div class="relative w-24 h-24">
        <!-- Image or placeholder with loading state -->
        <template v-if="currentImageUrl">
          <img
            :src="currentImageUrl"
            alt="Profile"
            class="w-full h-full object-cover rounded-full"
            @load="handleImageLoad"
          />
        </template>
        <div 
          v-else
          class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center"
        >
          <template v-if="isUploading">
            <svg class="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </template>
          <span v-else class="text-gray-500 text-xl">{{ initials }}</span>
        </div>
        
        <!-- Loading overlay for existing image -->
        <div 
          v-if="isLoading && currentImageUrl"
          class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- File preview if available -->
        <div 
          v-if="previewUrl && !currentImageUrl"
          class="absolute inset-0"
        >
          <img
            :src="previewUrl"
            alt="Preview"
            class="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      
      <div class="flex-1">
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          accept="image/*"
          @change="handleFileSelect"
        />

        <div class="flex flex-col space-y-2">
          <BaseButton
            type="button"
            @click="$refs.fileInput.click()"
            :disabled="isLoading || isUploading"
            :text="currentImageUrl ? 'Change Image' : 'Select Image'"
          />

          <BaseButton
            v-if="currentImageUrl"
            type="button"
            @click="handleRemoveImage"
            :disabled="isLoading || isUploading"
            variant="secondary"
            text="Remove Image"
          />
        </div>
      </div>
    </div>
    
    <!-- Selected file name -->
    <div v-if="selectedFileName" class="text-sm text-gray-600">
      Selected file: {{ selectedFileName }}
    </div>
    
    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Database } from '~/types/supabase'
import { useImageColor } from '~/composables/useImageColor'
import { useLoadingState } from '~/composables/useLoadingState'
import { useMembersStore } from '~/stores/members'

const props = defineProps<{
  currentImageUrl: string | null
  username: string
}>()

const emit = defineEmits<{
  (e: 'update:image', url: string | null): void
}>()

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { isLoading, error, withLoading } = useLoadingState()
const { getMedianColor } = useImageColor()
const membersStore = useMembersStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFileName = ref<string | null>(null)
const isUploading = ref(false)
const previewUrl = ref<string | null>(null)

const initials = computed(() => {
  return props.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

async function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.src) {
    try {
      const newColor = await getMedianColor(img.src)
      await membersStore.updateMemberBackgroundColor(user.value?.id || '', newColor)
    } catch (error) {
      throw error
    }
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  if (!user.value?.id) {
    error.value = 'You must be logged in to upload images'
    return
  }

  const file = input.files[0]
  selectedFileName.value = file.name
  isUploading.value = true

  // Create preview
  previewUrl.value = URL.createObjectURL(file)

  try {
    await withLoading(async () => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Selected file must be an image')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `profile/${user.value.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      emit('update:image', publicUrl)
      selectedFileName.value = null
      previewUrl.value = null
    })
  } catch (e: any) {
    error.value = e.message
  } finally {
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    isUploading.value = false
  }
}

async function handleRemoveImage() {
  if (!props.currentImageUrl || !user.value?.id) return

  try {
    await withLoading(async () => {
      if (!props.currentImageUrl) {
        throw new Error('No image URL provided')
      }

      const pathParts = props.currentImageUrl.split('profile-images/')[1]
      if (!pathParts) {
        throw new Error('Invalid image URL format')
      }

      const { error: deleteError } = await supabase.storage
        .from('profile-images')
        .remove([pathParts])

      if (deleteError) throw deleteError

      await membersStore.updateMemberBackgroundColor(
        user.value?.id || '', 
        'rgb(249, 250, 251)'
      )

      emit('update:image', null)
      previewUrl.value = null
    })
  } catch (e: any) {
    error.value = e.message
  }
}

onBeforeUnmount(() => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>