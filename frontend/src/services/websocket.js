import SockJS from 'sockjs-client'
import { over } from 'stompjs'
import keycloakService from './keycloakService'

let stompClient = null
let subscription = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

export const connectWebSocket = async (onMessageReceived, onError) => {
  if (stompClient && stompClient.connected) {
    console.log('Disconnecting existing WebSocket connection')
    disconnectWebSocket()
  }

  const socket = new SockJS('http://localhost:8080/ws')
  const client = over(socket)

  let token = null
  let userId = null
  try {
    if (keycloakService.keycloak && keycloakService.keycloak.token) {
      await keycloakService.updateToken(30)
      token = keycloakService.keycloak.token
      userId = keycloakService.userId
    }
  } catch (e) {
    console.error('Error getting Keycloak token for WebSocket:', e)
    if (onError) onError(e)
    return null
  }

  if (!token || !userId) {
    console.error('Token or userId not available for WebSocket connection')
    if (onError) onError(new Error('Authentication required'))
    return null
  }

  const headers = { 
    Authorization: `Bearer ${token}`,
    'X-User-Id': userId
  }

  return new Promise((resolve, reject) => {
    socket.onerror = (error) => {
      console.error('SockJS error:', error)
      reconnectAttempts++
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`SockJS error, will attempt to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        setTimeout(() => {
          connectWebSocket(onMessageReceived, onError)
        }, RECONNECT_DELAY)
      } else {
        if (onError) onError(error)
        reject(error)
      }
    }

    socket.onclose = (event) => {
      console.log('WebSocket closed', event.code, event.reason)
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log('Unexpected close, will attempt to reconnect...')
        reconnectAttempts++
        setTimeout(() => {
          connectWebSocket(onMessageReceived, onError)
        }, RECONNECT_DELAY)
      }
    }

    client.connect(
      headers,
      () => {
        console.log('WebSocket Connected successfully')
        reconnectAttempts = 0

        const destination = `/user/${userId}/chat`
        console.log('🔌 WebSocket: Subscribing to destination:', destination)
        console.log('🔌 WebSocket: User ID:', userId)
        
        try {
          subscription = client.subscribe(destination, (message) => {
            try {
              const data = JSON.parse(message.body)
              console.log('📨 WebSocket message received:', data)
              console.log('📨 Message type:', data.type)
              console.log('📨 Chat ID:', data.chatId)
              onMessageReceived(data)
            } catch (error) {
              console.error('❌ Error parsing WebSocket message:', error)
              console.error('❌ Raw message:', message.body)
            }
          }, {
            id: `sub-${userId}-${Date.now()}`
          })

          console.log('✅ WebSocket subscription established successfully!')
          console.log('✅ Subscription ID:', subscription.id)
          console.log('✅ Destination:', destination)
          console.log('✅ STOMP client connected:', client.connected)
          
          const statusSubscription = client.subscribe('/topic/user-status', (message) => {
            try {
              const data = JSON.parse(message.body)
              console.log('👤 User status update received:', data)
            } catch (error) {
              console.error('Error parsing user status update:', error)
            }
          })
          
          const syncSubscription = client.subscribe('/topic/user-sync', (message) => {
            try {
              const data = JSON.parse(message.body)
              console.log('🔄 User sync notification received:', data)
            } catch (error) {
              console.error('Error parsing user sync notification:', error)
            }
          })
          
          
          stompClient = client
          resolve(client)
        } catch (subError) {
          console.error('❌ Error subscribing to WebSocket:', subError)
          if (onError) onError(subError)
          reject(subError)
        }
      },
      (error) => {
        console.error('STOMP connection error:', error)
        reconnectAttempts++
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
          setTimeout(() => {
            connectWebSocket(onMessageReceived, onError)
          }, RECONNECT_DELAY)
        } else {
          console.error('Max reconnection attempts reached')
          if (onError) onError(error)
          reject(error)
        }
      }
    )
  })
}

export const disconnectWebSocket = () => {
  if (subscription) {
    subscription.unsubscribe()
    subscription = null
  }
  
  if (stompClient) {
    if (stompClient._heartbeatInterval) {
      clearInterval(stompClient._heartbeatInterval)
      stompClient._heartbeatInterval = null
    }
    
    if (stompClient.connected) {
      stompClient.disconnect(() => {
        console.log('WebSocket disconnected')
      })
    }
    stompClient = null
  }
  
  reconnectAttempts = 0
}

export const sendMessage = (destination, message) => {
  if (stompClient && stompClient.connected) {
    try {
      stompClient.send(`/app${destination}`, {}, JSON.stringify(message))
      console.log('Message sent to:', `/app${destination}`, message)
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      throw error
    }
  } else {
    const error = new Error('WebSocket not connected')
    console.error(error.message)
    throw error
  }
}

export const isConnected = () => {
  return stompClient && stompClient.connected
}

export const getStompClient = () => stompClient
