// services/SpotifyService.ts
import type { MediaDetails, SpotifyApiResponse } from '~/types/services';
import { MediaServiceError } from '~/types/services';

export class SpotifyService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getTrackDetails(trackId: string): Promise<MediaDetails> {
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': 'Bearer ' + this.accessToken
        }
      });

      if (!response.ok) {
        throw new MediaServiceError(
          `Spotify API error: ${response.statusText}`,
          response.status,
          'spotify/tracks'
        );
      }
      
      const data = await response.json() as SpotifyApiResponse;
      const duration = this.parseDuration(data.duration_ms);
      
      return {
        title: data.name,
        artist: data.artists[0].name,
        thumbnailUrl: data.album.images[1]?.url || data.album.images[0]?.url || '',
        duration
      };
    } catch (error: unknown) {
      if (error instanceof MediaServiceError) {
        throw error;
      }
      throw new MediaServiceError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'spotify/tracks'
      );
    }
  }

  private parseDuration(durationMs: number): { minutes: number, seconds: number } {
    const totalSeconds = Math.floor(durationMs / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    };
  }
}

// services/LinkParser.ts
export class LinkParser {
  static getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }

  static getSpotifyTrackId(url: string): string | null {
    const regExp = /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
}