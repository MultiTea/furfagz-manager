// server/api/spotify/refresh.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const refreshToken = getQuery(event).refresh_token as string

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing refresh token'
    })
  }

  const authHeader = Buffer.from(
    `${config.public.spotifyClientId}:${config.spotifyClientSecret}`
  ).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authHeader}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to refresh token'
    })
  }

  const data = await response.json()
  return data
})