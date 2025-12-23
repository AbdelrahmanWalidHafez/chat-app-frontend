import axios from 'axios'
import keycloakService from './keycloakService'

const API_BASE_URL = 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    try {
      if (keycloakService.keycloak && keycloakService.keycloak.token) {
        await keycloakService.updateToken(30)
        config.headers.Authorization = `Bearer ${keycloakService.keycloak.token}`
      }
    } catch (e) {
      console.warn('Error getting Keycloak token for API request:', e)
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshed = await keycloakService.updateToken(30)
        if (refreshed && keycloakService.keycloak.token) {
          error.config.headers.Authorization = `Bearer ${keycloakService.keycloak.token}`
          return api.request(error.config)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const chatApi = {
  getChats: () => api.get('/chats'),
  createChat: (senderId, receiverId) => 
    api.post('/chats', null, {
      params: {
        'sender-id': senderId,
        'receiver-id': receiverId
      }
    }),
}

export const messageApi = {
  getMessages: (chatId) => api.get(`/messages/chat/${chatId}`),
  sendMessage: (messageRequest) => api.post('/messages', messageRequest),
  updateMessage: (messageId, content) =>
    api.put(`/messages/${messageId}`, null, {
      params: { content }
    }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  uploadMedia: (chatId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('chat-id', chatId)
    return api.post('/messages/upload-media', formData)
  },
  markAsSeen: (chatId) =>
    api.patch('/messages', null, {
      params: { 'chat-id': chatId }
    }),
}

export const userApi = {
  getAllUsers: () => api.get('/users'),
}

export default api
