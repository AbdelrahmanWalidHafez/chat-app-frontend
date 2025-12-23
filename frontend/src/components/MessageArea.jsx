import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import Avatar from './Avatar'
import { ArrowLeft } from 'lucide-react'

const MessageArea = ({ chat, messages, currentUser, onSendMessage, users = [], onUpdateMessage, onDeleteMessage }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getChatName = () => {
    return chat.name || 'Unknown User'
  }

  const getRecipientUser = () => {
    if (!users || users.length === 0) return null
    const recipientId = chat.recipientId === currentUser?.id ? chat.senderId : chat.recipientId
    return users.find(u => u.id === recipientId)
  }

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return null
    try {
      const date = new Date(lastSeen)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      return format(date, 'MMM d, yyyy')
    } catch {
      return null
    }
  }

  const recipientUser = getRecipientUser()
  const isOnline = recipientUser?.isOnline === true || 
                   recipientUser?.isOnline === 'true' ||
                   recipientUser?.online === true ||
                   recipientUser?.online === 'true' ||
                   chat.isRecipientOnline === true ||
                   chat.isRecipientOnline === 'true'

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center space-x-4">
        <Avatar
          name={getChatName()}
          isOnline={isOnline}
          size="md"
        />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getChatName()}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOnline ? (
                'Online'
              ) : recipientUser?.lastSeen ? (
                `Last seen ${formatLastSeen(recipientUser.lastSeen)}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 bg-gray-50 dark:bg-gray-900">
        <MessageList 
          messages={messages} 
          currentUserId={currentUser?.id} 
          senderName={getChatName()}
          onUpdateMessage={onUpdateMessage}
          onDeleteMessage={onDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <MessageInput onSend={onSendMessage} />
      </div>
    </div>
  )
}

export default MessageArea

