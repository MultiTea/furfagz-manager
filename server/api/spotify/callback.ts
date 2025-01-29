// server/api/spotify/callback.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const code = getQuery(event).code as string

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing authorization code'
    })
  }

  const authHeader = Buffer.from(
    `${config.public.spotifyClientId}:${config.spotifyClientSecret}`
  ).toString('base64')

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:3000/api/spotify/callback' // Must match exactly
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Spotify token error:', error)
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to get access token'
      })
    }

    const data = await response.json()
    
    // Instead of returning directly, redirect to frontend with token
    return sendRedirect(event, `/?token=${data.access_token}&refresh_token=${data.refresh_token}&expires_in=${data.expires_in}`)
  } catch (error) {
    console.error('Error in callback:', error)
    throw error
  }
})