// server/api/spotify/get-preview.ts
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

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('band_members')
      .select('role')
      .eq('id', user.id)
      .single();

    // Need to specify the type for userData to avoid "never" type error
    if (userError || !userData || (userData as { role: string }).role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only administrators can use this API'
      });
    }

    // Get the track ID from the query
    const query = getQuery(event);
    const trackId = query.trackId as string;

    if (!trackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Track ID is required'
      });
    }

    // Create the embed URL
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
    
    // Fetch the embed page HTML
    const response = await fetch(embedUrl);
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch embed page: ${response.statusText}`
      });
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Use regex to find the audioPreview URL
    const regex = /"audioPreview":\s*{\s*"url":\s*"([^"]+)"/;
    const match = html.match(regex);
    
    if (match && match[1]) {
      return { previewUrl: match[1] };
    }
    
    // Alternative approach - look for previewUrl
    const previewUrlRegex = /"preview_url":\s*"([^"]+)"/;
    const previewMatch = html.match(previewUrlRegex);
    
    if (previewMatch && previewMatch[1]) {
      return { previewUrl: previewMatch[1] };
    }
    
    // If we can't find preview URL, return null
    return { previewUrl: null };
  } catch (error: any) {
    console.error('Error fetching preview URL:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Unknown error occurred'
    });
  }
});