// services/SpotifyService.ts
import type { MediaDetails, SpotifyApiResponse } from '~/types/services'
import { MediaServiceError } from '~/types/services'

export class SpotifyService {
  private token: string | null = null;

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('/api/spotify/get-token');

      if (!response.ok) {
        throw new MediaServiceError(
          'Failed to get Spotify access token',
          response.status,
          'spotify/token'
        );
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('No access token received');
      }

      this.token = data.access_token;
      return data.access_token;
    } catch (error) {
      if (error instanceof MediaServiceError) {
        throw error;
      }
      throw new MediaServiceError(
        'Error getting Spotify access token',
        500,
        'spotify/token'
      );
    }
  }

  private async getValidToken(): Promise<string> {
    if (!this.token) {
      return this.getAccessToken();
    }
    return this.token;
  }

  async getTrackDetails(trackId: string): Promise<MediaDetails> {
    try {
      const token = await this.getValidToken();

      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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
      return this.parseTrackData(data);
    } catch (error) {
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

  private parseTrackData(data: SpotifyApiResponse): MediaDetails {
    const duration = this.parseDuration(data.duration_ms);
    
    return {
      title: data.name,
      artist: data.artists[0].name,
      thumbnailUrl: data.album.images[1]?.url || data.album.images[0]?.url || '',
      duration
    };
  }

  private parseDuration(durationMs: number): { minutes: number, seconds: number } {
    const totalSeconds = Math.floor(durationMs / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    };
  }
}