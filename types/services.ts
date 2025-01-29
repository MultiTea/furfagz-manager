// types/services.ts
export interface MediaDetails {
    title: string;
    artist: string;
    thumbnailUrl: string;
    duration: {
      minutes: number;
      seconds: number;
    };
  }
  
  export interface ApiError extends Error {
    statusCode?: number;
    endpoint?: string;
  }
  
  export class MediaServiceError extends Error implements ApiError {
    statusCode?: number;
    endpoint?: string;
  
    constructor(
      message: string,
      statusCode?: number,
      endpoint?: string
    ) {
      super(message);
      this.name = 'MediaServiceError';
      this.statusCode = statusCode;
      this.endpoint = endpoint;
  
      // Ensure proper prototype chain for instanceof checks
      Object.setPrototypeOf(this, MediaServiceError.prototype);
    }
  }
  
  export interface YoutubeApiResponse {
    items?: Array<{
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
          default?: { url: string };
          medium?: { url: string };
        };
      };
      contentDetails: {
        duration: string;
      };
    }>;
  }
  
  export interface SpotifyApiResponse {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
    duration_ms: number;
  }