import { format, isToday, isYesterday } from 'date-fns'
import { MessageCircle, CheckCircle2 } from 'lucide-react'
import Avatar from './Avatar'

const ChatList = ({ chats, selectedChat, onSelectChat, loading }) => {
  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      const date = new Date(timeString)
      if (isToday(date)) {
        return format(date, 'HH:mm')
      } else if (isYesterday(date)) {
        return 'Yesterday'
      } else {
        return format(date, 'MMM d')
      }
    } catch {
      return timeString
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm mt-2">Start a new conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  selectedChat?.id === chat.id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar
                    name={chat.name}
                    isOnline={Boolean(chat.isRecipientOnline) || chat.isRecipientOnline === true || chat.isRecipientOnline === 'true'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {chat.name}
                      </h3>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTime(chat.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1 min-w-0">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {chat.unreadCount !== undefined && chat.unreadCount !== null && Number(chat.unreadCount) > 0 && (
                        <span className="bg-primary-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0">
                          {Number(chat.unreadCount) > 99 ? '99+' : Number(chat.unreadCount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList

