import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Global flag to prevent multiple initializations across remounts
let keycloakInitialized = false

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  const initRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current || keycloakInitialized) {
      console.log('AuthProvider: Already initialized, skipping')
      return
    }
    
    initRef.current = true
    keycloakInitialized = true
    console.log('AuthProvider: Starting initialization')
    
    const initKeycloak = async () => {
      try {
        const keycloakService = await import('../services/keycloakService').then(m => m.default)
        console.log('AuthProvider: Keycloak service imported')
        
        const isAuthenticated = await keycloakService.init({
          onLoad: 'login-required',
          checkLoginIframe: false
        })

        console.log('AuthProvider: Keycloak initialized, authenticated:', isAuthenticated)

        if (isAuthenticated) {
          const keycloak = keycloakService.keycloak
          setToken(keycloak.token)
          setAuthenticated(true)
          
          setUser({
            id: keycloakService.userId,
            email: keycloakService.email,
            name: keycloakService.fullName || keycloakService.preferredUsername,
            tokenParsed: keycloak.tokenParsed
          })

          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log('Token expired, refreshing...')
            keycloakService.updateToken(30).then((refreshed) => {
              if (refreshed) {
                setToken(keycloak.token)
                console.log('Token refreshed successfully')
              } else {
                console.error('Token refresh failed')
              }
            })
          }

          // Handle logout
          keycloak.onAuthLogout = () => {
            console.log('User logged out')
            setAuthenticated(false)
            setUser(null)
            setToken(null)
            keycloakInitialized = false
          }
        } else {
          setAuthenticated(false)
          setUser(null)
          setToken(null)
        }
      } catch (error) {
        console.error('AuthProvider: Keycloak initialization error:', error)
        setError(error.message || 'Failed to initialize authentication')
        setAuthenticated(false)
        setUser(null)
        setToken(null)
        keycloakInitialized = false
      } finally {
        setLoading(false)
        console.log('AuthProvider: Initialization complete')
      }
    }

    initKeycloak()

    // Cleanup function
    return () => {
      // Don't reset on unmount, only on logout
    }
  }, [])

  const login = async (options) => {
    try {
      const keycloakService = await import('../services/keycloakService').then(m => m.default)
      await keycloakService.login(options)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (options) => {
    try {
      const keycloakService = await import('../services/keycloakService').then(m => m.default)
      await keycloakService.register(options)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const keycloakService = await import('../services/keycloakService').then(m => m.default)
      
      // Clear local state first
      setAuthenticated(false)
      setUser(null)
      setToken(null)
      keycloakInitialized = false
      initRef.current = false
      
      // Call Keycloak logout
      await keycloakService.logout({ redirectUri: 'http://localhost:3000' })
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear state and redirect
      setAuthenticated(false)
      setUser(null)
      setToken(null)
      keycloakInitialized = false
      initRef.current = false
      window.location.href = 'http://localhost:3000'
    }
  }

  const accountManagement = () => {
    import('../services/keycloakService').then(m => {
      m.default.accountManagement()
    })
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    accountManagement,
    isAuthenticated: authenticated,
    loading,
    error
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              keycloakInitialized = false
              window.location.reload()
            }}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
