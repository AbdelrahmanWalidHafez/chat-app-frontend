import Keycloak from 'keycloak-js'

class KeycloakService {
  constructor() {
    this._keycloak = null
    this._initPromise = null
  }

  get keycloak() {
    if (!this._keycloak) {
      try {
        this._keycloak = new Keycloak({
          url: 'http://localhost:9090',
          realm: 'chatapp',
          clientId: 'chat-app'
        })
        console.log('Keycloak instance created')
      } catch (error) {
        console.error('Error creating Keycloak instance:', error)
        throw error
      }
    }
    return this._keycloak
  }

  async init(options = {}) {
    if (this._initPromise) {
      return this._initPromise
    }

    try {
      const defaultOptions = {
        onLoad: 'login-required',
        checkLoginIframe: false,
        ...options
      }

      console.log('Initializing Keycloak with options:', defaultOptions)

      this._initPromise = this.keycloak.init(defaultOptions)
        .then((authenticated) => {
          console.log('Keycloak initialized successfully, authenticated:', authenticated)
          // Clear URL hash/params after successful auth
          if (authenticated && (window.location.hash || window.location.search.includes('code'))) {
            window.history.replaceState({}, document.title, window.location.pathname)
          }
          return authenticated
        })
        .catch((error) => {
          console.error('Keycloak initialization failed:', error)
          this._initPromise = null
          throw error
        })

      return this._initPromise
    } catch (error) {
      console.error('Error in init method:', error)
      this._initPromise = null
      throw error
    }
  }

  async login(options = {}) {
    const defaultOptions = {
      redirectUri: 'http://localhost:3000',
      ...options
    }
    return this.keycloak.login(defaultOptions)
  }

  async register(options = {}) {
    const defaultOptions = {
      redirectUri: 'http://localhost:3000',
      ...options
    }
    return this.keycloak.register(defaultOptions)
  }

  async logout(options = {}) {
    const defaultOptions = {
      redirectUri: 'http://localhost:3000',
      ...options
    }
    return this.keycloak.logout(defaultOptions)
  }

  accountManagement() {
    return this.keycloak.accountManagement()
  }

  get userId() {
    return this.keycloak?.tokenParsed?.sub || null
  }

  get isTokenValid() {
    return this.keycloak ? !this.keycloak.isTokenExpired() : false
  }

  get fullName() {
    return this.keycloak?.tokenParsed?.['name'] || null
  }

  get email() {
    return this.keycloak?.tokenParsed?.['email'] || null
  }

  get preferredUsername() {
    return this.keycloak?.tokenParsed?.['preferred_username'] || null
  }

  get token() {
    return this.keycloak?.token || null
  }

  get refreshToken() {
    return this.keycloak?.refreshToken || null
  }

  async updateToken(minValidity = 5) {
    if (this.keycloak) {
      try {
        const refreshed = await this.keycloak.updateToken(minValidity)
        return refreshed
      } catch (error) {
        console.error('Failed to refresh token:', error)
        return false
      }
    }
    return false
  }

  hasRealmRole(role) {
    return this.keycloak?.hasRealmRole(role) || false
  }

  hasResourceRole(role, resource) {
    return this.keycloak?.hasResourceRole(role, resource) || false
  }
}

export default new KeycloakService()
