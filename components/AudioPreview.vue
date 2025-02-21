<template>
  <div class="relative">
    <div 
      class="audio-thumbnail"
      @mouseenter="startPreview"
      @mouseleave="stopPreview"
      @click="handleClick"
    >
      <slot></slot>
      
      <!-- Preview Indicator - Only show during active hover or actual playback -->
      <div 
        v-if="previewUrl && ((isHovering && !hasBeenPlayed) || isPlaying)" 
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 rounded-lg"
      >
        <div class="text-white">
          <!-- Play Icon - only on hover before played -->
          <div v-if="isHovering && !isPlaying" class="play-icon">
            <div class="play-triangle"></div>
          </div>
          <!-- Audio Wave Animation When Playing -->
          <div v-if="isPlaying" class="audio-wave">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Audio Element (hidden) -->
    <audio ref="audioPlayer" :src="previewUrl || undefined" preload="auto"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useAudioController } from '~/composables/useAudioController';

const props = defineProps<{
  previewUrl: string | null | undefined;
  previewId?: string; // Unique identifier for this preview
}>();

// Generate a unique ID if not provided
const uniqueId = computed(() => props.previewId || `preview-${Math.random().toString(36).substring(2, 9)}`);

const audioPlayer = ref<HTMLAudioElement | null>(null);
const isHovering = ref(false);
const isPlaying = ref(false);
const hasBeenPlayed = ref(false);
const isMobile = ref(false);
// Use our audio controller
const { registerAudio } = useAudioController();

// Check if device is mobile
function checkMobile() {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Initialize audio and register with controller when the component is mounted
onMounted(() => {
  // Check if we're on a mobile device
  checkMobile();
  
  if (audioPlayer.value && props.previewUrl) {
    // Set initial volume
    audioPlayer.value.volume = 0.7;
    
    // Register with audio controller
    const { isActive } = registerAudio(audioPlayer.value, uniqueId.value);
    
    // Add event listeners for play/ended states
    audioPlayer.value.addEventListener('play', () => {
      isPlaying.value = true;
    });
    
    audioPlayer.value.addEventListener('ended', () => {
      isPlaying.value = false;
      isHovering.value = false;
    });
    
    audioPlayer.value.addEventListener('pause', () => {
      isPlaying.value = false;
    });
    
    // Handle browser errors
    audioPlayer.value.addEventListener('error', () => {
      isPlaying.value = false;
    });
    
    // Preload metadata
    audioPlayer.value.load();
  }
});

// Watch for changes in the preview URL
watch(() => props.previewUrl, (newUrl) => {
  if (newUrl && audioPlayer.value) {
    // Reload audio when URL changes
    audioPlayer.value.load();
  }
});

// Handle for desktop (hover)
function startPreview() {
  if (!props.previewUrl || isMobile.value) return;
  
  isHovering.value = true;
  
  // Play the audio if it's not already playing
  if (audioPlayer.value && !isPlaying.value) {
    // Use a user interaction promise to handle autoplay policy
    const userInteraction = () => {
      if (audioPlayer.value) {
        return audioPlayer.value.play()
          .then(() => {
            hasBeenPlayed.value = true;
          })
          .catch(error => {
            // Autoplay blocked or other error
            isPlaying.value = false;
          });
      }
      return Promise.resolve();
    };
    
    // Try to play
    userInteraction();
  }
}

function stopPreview() {
  if (isMobile.value) return;
  
  isHovering.value = false;
  
  if (audioPlayer.value && isPlaying.value) {
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
  }
}

// Simplified click handler for both desktop and mobile
function handleClick(event: MouseEvent) {
  // Prevent click from propagating to parent elements
  event.stopPropagation();
  
  if (!props.previewUrl || !audioPlayer.value) return;

  if (isPlaying.value) {
    // If already playing, stop it
    audioPlayer.value.pause();
    audioPlayer.value.currentTime = 0;
    isPlaying.value = false;
  } else {
    // If not playing, start it (this will automatically stop others via the controller)
    try {
      const playPromise = audioPlayer.value.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasBeenPlayed.value = true;
          })
          .catch(() => {
            // Reset playing state on error
            isPlaying.value = false;
          });
      }
    } catch (e) {
      // Fallback for any synchronous errors
      isPlaying.value = false;
    }
  }
}

// Clean up on component unmount
onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('play', () => isPlaying.value = true);
    audioPlayer.value.removeEventListener('ended', () => {
      isPlaying.value = false;
      isHovering.value = false;
    });
    audioPlayer.value.removeEventListener('pause', () => isPlaying.value = false);
    audioPlayer.value.removeEventListener('error', () => {});
    
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

/* Play button styles */
.play-icon {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-triangle {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent white;
  margin-left: 4px; /* Centering adjustment */
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