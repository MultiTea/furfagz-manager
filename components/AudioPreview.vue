// components/AudioPreview.vue
<template>
  <div class="relative">
    <div 
      class="audio-thumbnail"
      @mouseenter="startPreview"
      @mouseleave="stopPreview"
    >
      <slot></slot>
      
      <!-- Preview Indicator -->
      <div 
        v-if="previewUrl && isHovering" 
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 rounded-lg"
      >
        <div class="text-white">
          <svg 
            v-if="!isPlaying" 
            class="w-8 h-8" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
          <div v-else class="audio-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Audio Element (hidden) -->
    <audio ref="audioPlayer" :src="previewUrl || undefined" preload="none"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  previewUrl: string | null | undefined;
}>();

const audioPlayer = ref<HTMLAudioElement | null>(null);
const isHovering = ref(false);
const isPlaying = ref(false);

function startPreview() {
  if (!props.previewUrl) return;
  
  isHovering.value = true;
  
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.7;
    audioPlayer.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch(error => {
        console.error('Error playing audio preview:', error);
      });
  }
}

function stopPreview() {
  isHovering.value = false;
  isPlaying.value = false;
  
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
  }
}

// Clean up on component unmount
onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  }
});
</script>

<style scoped>
.audio-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.audio-wave span {
  display: block;
  width: 3px;
  height: 12px;
  margin: 0 2px;
  background-color: white;
  border-radius: 1px;
  animation: wave 1.2s infinite ease-in-out;
}

.audio-wave span:nth-child(2) {
  animation-delay: 0.2s;
}

.audio-wave span:nth-child(3) {
  animation-delay: 0.4s;
}

.audio-wave span:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.5);
  }
  20% {
    transform: scaleY(1);
  }
}
</style>