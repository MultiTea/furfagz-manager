// services/YouTubeService.ts
import type { MediaDetails, YoutubeApiResponse, YouTubeThumbnails } from '~/types/services';
import { MediaServiceError } from '~/types/services';

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getVideoDetails(videoId: string): Promise<MediaDetails> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        new URLSearchParams({
          id: videoId,
          part: 'snippet,contentDetails,status',
          key: this.apiKey
        })
      );

      if (!response.ok) {
        throw new MediaServiceError(
          `YouTube API error: ${response.statusText}`,
          response.status,
          'youtube/videos'
        );
      }

      const data = await response.json() as YoutubeApiResponse;

      if (!data.items || data.items.length === 0) {
        throw new MediaServiceError(
          'Video not found or is private',
          404,
          'youtube/videos'
        );
      }

      const video = data.items[0];
      const duration = this.parseDuration(video.contentDetails.duration);
      const thumbnailUrl = this.getBestThumbnailUrl(videoId, video.snippet.thumbnails);

      return {
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        thumbnailUrl,
        duration
      };
    } catch (error: unknown) {
      if (error instanceof MediaServiceError) {
        throw error;
      }
      throw new MediaServiceError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
        'youtube/videos'
      );
    }
  }

  private getBestThumbnailUrl(videoId: string, thumbnails: YouTubeThumbnails): string {
    // Custom high quality thumbnail URL
    const hqThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    // If maxres is available, use it
    if (thumbnails.maxres?.url) {
      return thumbnails.maxres.url;
    }
    
    // If standard is available, use it
    if (thumbnails.standard?.url) {
      return thumbnails.standard.url;
    }
    
    // If high is available, use it
    if (thumbnails.high?.url) {
      return thumbnails.high.url;
    }
    
    // Fall back to our custom HQ thumbnail
    return hqThumbnail;
  }

  private parseDuration(duration: string): { minutes: number, seconds: number } {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const [, hours, mins, secs] = match;
      return {
        minutes: parseInt(mins || '0') + (parseInt(hours || '0') * 60),
        seconds: parseInt(secs || '0')
      };
    }
    return { minutes: 0, seconds: 0 };
  }
}