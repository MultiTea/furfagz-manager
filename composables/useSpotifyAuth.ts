// composables/useSpotifyAuth.ts
export function useSpotifyAuth() {
    const tokenData = useState<{
      access_token: string;
      refresh_token: string;
      expires_at: number;
    } | null>('spotify_token_data', () => {
      // Try to load from localStorage on client side
      if (process.client) {
        const stored = localStorage.getItem('spotify_token_data')
        return stored ? JSON.parse(stored) : null
      }
      return null
    })
  
    const storeTokenData = (data: any) => {
      const expiresAt = Date.now() + data.expires_in * 1000
  
      const newTokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || tokenData.value?.refresh_token,
        expires_at: expiresAt
      }
  
      tokenData.value = newTokenData
  
      // Store in localStorage
      if (process.client) {
        localStorage.setItem('spotify_token_data', JSON.stringify(newTokenData))
      }
    }
  
    const handleCallback = async (code: string) => {
      try {
        const response = await fetch(`/api/spotify/callback?code=${code}`)
        if (!response.ok) throw new Error('Failed to get access token')
        
        const data = await response.json()
        storeTokenData(data)
        return data.access_token
      } catch (error) {
        console.error('Error handling Spotify callback:', error)
        throw error
      }
    }
  
    const refreshToken = async () => {
      if (!tokenData.value?.refresh_token) return null
  
      try {
        const response = await fetch(
          `/api/spotify/refresh?refresh_token=${tokenData.value.refresh_token}`
        )
  
        if (!response.ok) throw new Error('Failed to refresh token')
        
        const data = await response.json()
        storeTokenData(data)
        return data.access_token
      } catch (error) {
        console.error('Error refreshing token:', error)
        return null
      }
    }
  
    const getValidToken = async () => {
      // If no token at all, handle initial auth
      if (!tokenData.value) {
        return null
      }
  
      // Check if token needs refresh (refresh 1 minute before expiry)
      if (Date.now() >= tokenData.value.expires_at - 60000) {
        return await refreshToken()
      }
  
      return tokenData.value.access_token
    }
  
    const clearTokens = () => {
      tokenData.value = null
      if (process.client) {
        localStorage.removeItem('spotify_token_data')
      }
    }
  
    return {
      tokenData,
      handleCallback,
      refreshToken,
      getValidToken,
      storeTokenData,
      clearTokens
    }
  }