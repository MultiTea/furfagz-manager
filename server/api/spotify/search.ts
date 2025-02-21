// server/api/spotify/search.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
  try {
    // Get Supabase client and user using server methods
    const supabase = await serverSupabaseClient(event);
    const user = await serverSupabaseUser(event);

    // Check if user is authenticated
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in to use this API'
      });
    }

    // Get the query parameters
    const query = getQuery(event);
    const artist = query.artist as string;
    const title = query.title as string;

    if (!artist || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Artist and title parameters are required'
      });
    }

    // Construct search query
    const searchQuery = `${artist} ${title}`;
    
    // First get a token
    const config = useRuntimeConfig();
    
    // Log config for debugging (remove in production)
    console.log('Config keys available:', Object.keys(config));
    console.log('Public config keys:', Object.keys(config.public));
    
    if (!config.public.spotifyClientId || !config.spotifyClientSecret) {
      console.error('Missing Spotify credentials');
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: Missing Spotify credentials'
      });
    }
    
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.public.spotifyClientId,
        client_secret: config.spotifyClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Spotify token', tokenResponse.status, tokenResponse.statusText);
      throw createError({
        statusCode: tokenResponse.status,
        statusMessage: 'Failed to get Spotify token'
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('No access token received from Spotify');
      throw createError({
        statusCode: 500,
        statusMessage: 'No access token received from Spotify'
      });
    }

    // Search Spotify
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`;
    console.log('Searching Spotify with URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!searchResponse.ok) {
      console.error('Failed to search Spotify', searchResponse.status, searchResponse.statusText);
      throw createError({
        statusCode: searchResponse.status,
        statusMessage: 'Failed to search Spotify'
      });
    }

    const searchData = await searchResponse.json();
    
    // If no tracks found, return empty result
    if (!searchData.tracks || !searchData.tracks.items || searchData.tracks.items.length === 0) {
      return { 
        found: false,
        message: 'No matching tracks found on Spotify' 
      };
    }

    // Get the first (best) match
    const bestMatch = searchData.tracks.items[0];
    
    // Try to get preview URL
    let previewUrl = bestMatch.preview_url;
    
    // If the API doesn't return a preview URL directly, try to get it from the track page
    if (!previewUrl) {
      const trackId = bestMatch.id;
      
      try {
        // Use the same approach as in get-preview.ts
        const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
        const embedResponse = await fetch(embedUrl);
        
        if (embedResponse.ok) {
          const html = await embedResponse.text();
          
          // Use regex to find the audioPreview URL
          const regex = /"audioPreview":\s*{\s*"url":\s*"([^"]+)"/;
          const match = html.match(regex);
          
          if (match && match[1]) {
            previewUrl = match[1];
          } else {
            // Alternative approach - look for previewUrl
            const previewUrlRegex = /"preview_url":\s*"([^"]+)"/;
            const previewMatch = html.match(previewUrlRegex);
            
            if (previewMatch && previewMatch[1]) {
              previewUrl = previewMatch[1];
            }
          }
        }
      } catch (error) {
        console.error('Error extracting preview URL:', error);
      }
    }

    return {
      found: true,
      trackId: bestMatch.id,
      trackName: bestMatch.name,
      artistName: bestMatch.artists[0].name,
      spotifyUrl: bestMatch.external_urls.spotify,
      previewUrl: previewUrl,
      albumImageUrl: bestMatch.album.images[1]?.url || bestMatch.album.images[0]?.url
    };
    
  } catch (error: any) {
    console.error('Error in Spotify search:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Unknown error occurred'
    });
  }
});