import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { chatApi, messageApi, userApi } from '../services/api'
import { connectWebSocket, disconnectWebSocket } from '../services/websocket'
import ChatList from '../components/ChatList'
import MessageArea from '../components/MessageArea'
import UserList from '../components/UserList'
import { LogOut, Users, User } from 'lucide-react'

const ChatPage = () => {
  const { user, logout, accountManagement } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = 'http://localhost:3000'
    }
  }
  
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [showUserList, setShowUserList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const wsConnected = useRef(false)
  const selectedChatRef = useRef(null)
  const loadChatsRef = useRef(null)
  const loadMessagesRef = useRef(null)

  useEffect(() => {
    selectedChatRef.current = selectedChat
  }, [selectedChat])

  console.log('ChatPage rendering, user:', user)

  const loadChats = useCallback(async () => {
    try {
      const response = await chatApi.getChats()
      setChats(response.data || [])
    } catch (error) {
      console.error('Error loading chats:', error)
      if (error.response?.status !== 401) {
        setChats([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return []
    try {
      console.log('📥 Loading messages for chat:', chatId)
      const response = await messageApi.getMessages(chatId)
      let messages = response.data || []
      messages = messages.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || 0)
        const dateB = new Date(b.createdAt || b.createdDate || 0)
        return dateA - dateB
      })
      console.log('📥 Loaded', messages.length, 'messages (sorted)')
      setMessages(messages)
      return messages
    } catch (error) {
      console.error('❌ Error loading messages:', error)
      setMessages([])
      return []
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const response = await userApi.getAllUsers()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      if (error.response?.status === 401) {
        return
      }
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user || !user.id) {
      return
    }

    loadChats()
    loadUsers()
    
    const refreshInterval = setInterval(() => {
      console.log('🔄 Periodic refresh: updating chats and users...')
      loadChats().catch(console.error)
      loadUsers().catch(console.error)
    }, 5000)
    
    const connectWS = async () => {
      if (wsConnected.current) {
        return
      }

      try {
        await connectWebSocket(
          (notification) => {
            console.log('Received notification:', notification)
            
            switch (notification.type) {
              case 'MESSAGE':
              case 'IMAGE':
                const currentChatId = selectedChatRef.current?.id
                console.log('Message notification received:', {
                  notificationChatId: notification.chatId,
                  currentChatId: currentChatId,
                  type: notification.type
                })
                
                loadChats().catch(console.error)
                loadUsers().catch(console.error)
                
                if (currentChatId && notification.chatId === currentChatId) {
                  console.log('🔄 Reloading messages for current chat immediately...')
                  const reloadFn = loadMessagesRef.current || loadMessages
                  reloadFn(notification.chatId)
                    .then((newMessages) => {
                      console.log('✅ Messages reloaded for current chat, count:', newMessages?.length || 0)
                      if (newMessages && Array.isArray(newMessages)) {
                        setMessages([...newMessages])
                      }
                      messageApi.markAsSeen(notification.chatId)
                        .then(() => {
                          loadChats().catch(console.error)
                        })
                        .catch(console.error)
                    })
                    .catch(err => console.error('❌ Error reloading messages:', err))
                }
                break
                
              case 'SEEN':
                if (selectedChatRef.current && notification.chatId === selectedChatRef.current.id) {
                  loadMessages(notification.chatId).catch(console.error)
                }
                loadChats().catch(console.error)
                break
                
              case 'USER_STATUS_UPDATE':
              case 'USER_SYNC':
                console.log('👤 User status update received, refreshing users and chats...')
                loadUsers().catch(console.error)
                loadChats().catch(console.error)
                break
                
              default:
                console.warn('Unknown notification type:', notification.type)
                loadChats().catch(console.error)
            }
          },
          (error) => {
            console.error('WebSocket error:', error)
            wsConnected.current = false
          }
        )
        wsConnected.current = true
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        wsConnected.current = false
      }
    }
    
    connectWS()

    return () => {
      clearInterval(refreshInterval)
      disconnectWebSocket()
      wsConnected.current = false
    }
  }, [user, loadChats, loadMessages, loadUsers])

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      console.log('💬 Chat selected, loading messages and marking as seen:', selectedChat.id)
      loadMessages(selectedChat.id)
        .then(() => {
          console.log('✅ Messages loaded for selected chat')
        })
        .catch(console.error)
      
      messageApi.markAsSeen(selectedChat.id)
        .then(() => {
          console.log('✅ Messages marked as seen')
          loadChats().catch(console.error)
        })
        .catch(console.error)
    }
  }, [selectedChat, loadMessages, loadChats])

  const handleSendMessage = async (content, file) => {
    if (!selectedChat || !user || !user.id) {
      console.error('Cannot send message: missing chat or user')
      return
    }

    if (!file && (!content || !content.trim())) {
      console.warn('Cannot send empty message')
      return
    }

    try {
      let receiverId = null
      if (selectedChat.senderId === user.id) {
        receiverId = selectedChat.recipientId
      } else if (selectedChat.recipientId === user.id) {
        receiverId = selectedChat.senderId
      } else {
        console.warn('Current user not found in chat participants, using recipientId')
        receiverId = selectedChat.recipientId
      }

      if (!receiverId) {
        console.error('Could not determine receiver ID')
        alert('Error: Could not determine recipient. Please try again.')
        return
      }

      if (!selectedChat.id) {
        console.error('Chat ID is missing')
        alert('Error: Chat ID is missing. Please select a chat.')
        return
      }
      
      if (file) {
        console.log('📤 Uploading file:', file.name, file.type, file.size, 'to chat:', selectedChat.id)
        await messageApi.uploadMedia(selectedChat.id, file)
        console.log('✅ File uploaded successfully')
      } else if (content && content.trim()) {
        const messageData = {
          content: content.trim(),
          senderId: user.id,
          receiverId: receiverId,
          messageType: 'TEXT',
          chatId: selectedChat.id
        }
        console.log('📤 Sending text message:', messageData)
        await messageApi.sendMessage(messageData)
        console.log('✅ Message sent successfully')
      }
      
      await loadMessages(selectedChat.id)
      await loadChats()
      await loadUsers()
    } catch (error) {
      console.error('❌ Error sending message:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error data:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error config:', error.config)
      
      let errorMessage = 'Unknown error occurred'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        } else {
          errorMessage = JSON.stringify(error.response.data)
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`Failed to send message: ${errorMessage}\n\nStatus: ${error.response?.status || 'N/A'}\n\nCheck browser console for more details.`)
    }
  }

  const handleCreateChat = async (receiverId) => {
    if (!user || !user.id) {
      console.error('User not available')
      return
    }

    if (receiverId === user.id) {
      console.error('Cannot create chat with yourself')
      alert('Cannot create chat with yourself')
      return
    }

    try {
      const response = await chatApi.createChat(user.id, receiverId)
      const responseText = typeof response.data === 'string' ? response.data : response.data.toString()
      const chatId = responseText.match(/chat_id: (.+)/)?.[1]
      
      if (chatId) {
        await loadChats()
        
        const response = await chatApi.getChats()
        const updatedChats = response.data || []
        const newChat = updatedChats.find(c => c.id === chatId)
        if (newChat) {
          console.log('Selected chat:', newChat)
          console.log('Current user ID:', user.id)
          console.log('Chat senderId:', newChat.senderId)
          console.log('Chat recipientId:', newChat.recipientId)
          setSelectedChat(newChat)
        } else {
          setSelectedChat({ 
            id: chatId, 
            senderId: user.id,
            recipientId: receiverId,
            name: 'Loading...'
          })
        }
        setShowUserList(false)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
      alert('Failed to create chat. Please try again.')
    }
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
    setShowUserList(false)
  }

  const handleUpdateMessage = async (messageId, content) => {
    try {
      await messageApi.updateMessage(messageId, content)
      if (selectedChat?.id) {
        await loadMessages(selectedChat.id)
        await loadChats()
      }
    } catch (error) {
      console.error('Error updating message:', error)
      alert('Failed to update message. Please try again.')
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) {
      console.error('Message ID is missing')
      return
    }
    try {
      console.log('Deleting message with ID:', messageId, 'Type:', typeof messageId)
      await messageApi.deleteMessage(Number(messageId))
      if (selectedChat?.id) {
        await loadMessages(selectedChat.id)
        await loadChats()
      } else {
        await loadChats()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      console.error('Error response:', error.response?.data)
      alert('Failed to delete message. Please try again.')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Chat App</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name || user?.email}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="New Chat"
          >
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={accountManagement}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Account Settings"
          >
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showUserList ? 'hidden' : 'flex'} md:flex w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            loading={loading}
          />
        </div>

        {showUserList && (
          <div className="flex w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <UserList
              users={users}
              currentUserId={user?.id}
              onCreateChat={handleCreateChat}
              onClose={() => setShowUserList(false)}
              loading={usersLoading}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <MessageArea
              chat={selectedChat}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              users={users}
              onUpdateMessage={handleUpdateMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
