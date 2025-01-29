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