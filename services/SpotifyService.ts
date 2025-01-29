// services/SpotifyService.ts
import type { MediaDetails, SpotifyApiResponse } from '~/types/services'
import { MediaServiceError } from '~/types/services'

export class SpotifyService {
  private tokenRefreshPromise: Promise<string | null> | null = null;

  constructor() {
    // No arguments needed anymore since we're using the composable
  }

  async getTrackDetails(trackId: string): Promise<MediaDetails> {
    try {
      const token = await this.getValidToken()
      if (!token) {
        throw new MediaServiceError(
          'No valid Spotify access token available',
          401,
          'spotify/tracks'
        )
      }

      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        // Token might have expired during the request, try once more with a fresh token
        const newToken = await this.getValidToken(true)
        if (!newToken) {
          throw new MediaServiceError(
            'Failed to refresh Spotify token',
            401,
            'spotify/tracks'
          )
        }

        const retryResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${newToken}`
          }
        })

        if (!retryResponse.ok) {
          throw new MediaServiceError(
            `Spotify API error: ${retryResponse.statusText}`,
            retryResponse.status,
            'spotify/tracks'
          )
        }

        const data = await retryResponse.json() as SpotifyApiResponse
        return this.parseTrackData(data)
      }

      if (!response.ok) {
        throw new MediaServiceError(
          `Spotify API error: ${response.statusText}`,
          response.status,
          'spotify/tracks'
        )
      }

      const data = await response.json() as SpotifyApiResponse
      return this.parseTrackData(data)
    } catch (error) {
      if (error instanceof MediaServiceError) {
        throw error
      }
      throw new MediaServiceError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'spotify/tracks'
      )
    }
  }

  private async getValidToken(forceRefresh = false): Promise<string | null> {
    // If we're already refreshing the token, wait for that to complete
    if (this.tokenRefreshPromise) {
      return await this.tokenRefreshPromise
    }

    const { getValidToken } = useSpotifyAuth()
    
    try {
      this.tokenRefreshPromise = getValidToken()
      return await this.tokenRefreshPromise
    } finally {
      this.tokenRefreshPromise = null
    }
  }

  private parseTrackData(data: SpotifyApiResponse): MediaDetails {
    const duration = this.parseDuration(data.duration_ms)
    
    return {
      title: data.name,
      artist: data.artists[0].name,
      thumbnailUrl: data.album.images[1]?.url || data.album.images[0]?.url || '',
      duration
    }
  }

  private parseDuration(durationMs: number): { minutes: number, seconds: number } {
    const totalSeconds = Math.floor(durationMs / 1000)
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    }
  }
}