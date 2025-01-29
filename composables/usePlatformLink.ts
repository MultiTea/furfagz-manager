// composables/usePlatformLink.ts
interface PlatformInfo {
    name: 'YouTube' | 'Spotify' | null;
    color: string;
    hoverColor: string;
    textColor: string;
  }
  
  export function usePlatformLink() {
    const getPlatformInfo = (link: string | null): PlatformInfo => {
      if (!link) return { name: null, color: '', hoverColor: '', textColor: '' };
  
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        return {
          name: 'YouTube',
          color: 'bg-red-600',
          hoverColor: 'hover:bg-red-700',
          textColor: 'text-white'
        };
      }
  
      if (link.includes('spotify.com')) {
        return {
          name: 'Spotify',
          color: 'bg-green-600',
          hoverColor: 'hover:bg-green-700',
          textColor: 'text-white'
        };
      }
  
      return { name: null, color: '', hoverColor: '', textColor: '' };
    };
  
    const formatButtonText = (platform: PlatformInfo['name']) => {
      return platform ? `Play on ${platform}` : '';
    };
  
    return {
      getPlatformInfo,
      formatButtonText
    };
  }