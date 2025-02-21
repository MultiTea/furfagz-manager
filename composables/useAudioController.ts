// composables/useAudioController.ts
import { ref } from 'vue';

// Singleton pattern to ensure we only have one audio controller instance
let activeAudio: HTMLAudioElement | null = null;
const activePreviewId = ref<string | null>(null);

export function useAudioController() {
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
      isActive: (id: string) => activePreviewId.value === id,
      stopAllOthers: () => {
        if (activeAudio && activeAudio !== audioElement) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        }
      }
    };
  }

  return {
    registerAudio,
    activePreviewId
  };
}