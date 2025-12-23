// Keycloak configuration - using endpoints from discovery document
export const keycloakConfig = {
  issuer: 'http://localhost:9090/realms/chatapp',
  authorizationEndpoint: 'http://localhost:9090/realms/chatapp/protocol/openid-connect/auth',
  tokenEndpoint: 'http://localhost:9090/realms/chatapp/protocol/openid-connect/token',
  userInfoEndpoint: 'http://localhost:9090/realms/chatapp/protocol/openid-connect/userinfo',
  endSessionEndpoint: 'http://localhost:9090/realms/chatapp/protocol/openid-connect/logout',
  jwksUri: 'http://localhost:9090/realms/chatapp/protocol/openid-connect/certs',
  // Update this with your actual Keycloak client ID
  // Check Keycloak Admin Console -> Clients
  clientId: 'chat-app-client', 
  redirectUri: 'http://localhost:3000'
}

// Generate PKCE code verifier and challenge (simplified version)
export const generatePKCE = async () => {
  try {
    // Generate random code verifier
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    // Generate code challenge using SHA-256
    if (crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      
      return { codeVerifier, codeChallenge }
    } else {
      // Fallback: use code verifier as challenge (less secure, but works)
      console.warn('crypto.subtle not available, using plain code challenge')
      return { codeVerifier, codeChallenge: codeVerifier }
    }
  } catch (error) {
    console.error('PKCE generation error:', error)
    // Fallback: generate simple random string
    const fallback = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return { codeVerifier: fallback, codeChallenge: fallback }
  }
}

// Get Keycloak login URL with PKCE
export const getKeycloakLoginUrl = async () => {
  try {
    const { authorizationEndpoint, clientId, redirectUri } = keycloakConfig
    
    // Generate PKCE
    const { codeVerifier, codeChallenge } = await generatePKCE()
    
    // Store code verifier for later use
    sessionStorage.setItem('pkce_code_verifier', codeVerifier)
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })
    
    return `${authorizationEndpoint}?${params.toString()}`
  } catch (error) {
    console.error('Error generating login URL:', error)
    throw error
  }
}

// Exchange authorization code for token
export const exchangeCodeForToken = async (code) => {
  const { tokenEndpoint, clientId, redirectUri } = keycloakConfig
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found')
  }
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  })
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }
  
  const data = await response.json()
  sessionStorage.removeItem('pkce_code_verifier')
  
  return data
}

// Get user info from token
export const getUserInfo = async (accessToken) => {
  const { userInfoEndpoint } = keycloakConfig
  
  const response = await fetch(userInfoEndpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to get user info')
  }
  
  return response.json()
}

export const getKeycloakLogoutUrl = () => {
  const { endSessionEndpoint, redirectUri } = keycloakConfig
  return `${endSessionEndpoint}?redirect_uri=${encodeURIComponent(redirectUri)}`
}

