// composables/useAudioController.ts
import { ref } from 'vue';

// Singleton pattern to ensure we only have one audio controller instance
let activeAudio: HTMLAudioElement | null = null;
const activePreviewId = ref<string | null>(null);

// Global permissions state
const hasUserInteracted = ref(false);

export function useAudioController() {
  // Track user interaction to help with autoplay restrictions
  if (process.client) {
    // This will run only on the client side
    if (!hasUserInteracted.value) {
      const handleUserInteraction = () => {
        hasUserInteracted.value = true;
        // Remove event listeners after first interaction
        ['click', 'touchstart', 'keydown'].forEach(eventType => {
          document.removeEventListener(eventType, handleUserInteraction);
        });
      };
      
      // Add event listeners to detect user interaction
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction, { passive: true });
      document.addEventListener('keydown', handleUserInteraction);
    }
  }

  // Register a new audio element with the controller
  function registerAudio(audioElement: HTMLAudioElement, previewId: string) {
    // When a new audio starts playing, stop the previously active one
    audioElement.addEventListener('play', () => {
      if (activeAudio && activeAudio !== audioElement) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = audioElement;
      activePreviewId.value = previewId;
    });

    // Clear the active audio reference when audio ends or is paused
    audioElement.addEventListener('ended', () => {
      if (activeAudio === audioElement) {
        activePreviewId.value = null;
        activeAudio = null;
      }
    });

    audioElement.addEventListener('pause', () => {
      if (activeAudio === audioElement) {
        activePreviewId.value = null;
        activeAudio = null;
      }
    });

    return {
      isActive: () => activePreviewId.value === previewId,
      stopAllOthers: () => {
        if (activeAudio && activeAudio !== audioElement) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        }
      },
      canAutoplay: () => hasUserInteracted.value
    };
  }

  return {
    registerAudio,
    activePreviewId,
    hasUserInteracted
  };
}