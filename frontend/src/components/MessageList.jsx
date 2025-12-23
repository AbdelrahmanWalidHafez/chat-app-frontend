import { format, isToday, isSameDay } from 'date-fns'
import Message from './Message'

const MessageList = ({ messages, currentUserId, senderName, onUpdateMessage, onDeleteMessage }) => {
  const groupedMessages = []
  let currentGroup = null

  messages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt)
    const prevMessage = index > 0 ? messages[index - 1] : null
    const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null

    if (!prevDate || !isSameDay(messageDate, prevDate)) {
      groupedMessages.push({
        type: 'date',
        date: messageDate
      })
    }

    const shouldGroup = prevMessage &&
      prevMessage.senderId === message.senderId &&
      isSameDay(messageDate, prevDate) &&
      (messageDate - prevDate) < 5 * 60 * 1000

    if (!shouldGroup) {
      currentGroup = {
        type: 'message-group',
        senderId: message.senderId,
        messages: []
      }
      groupedMessages.push(currentGroup)
    }

    currentGroup.messages.push(message)
  })

  return (
    <div className="space-y-1" key={`message-list-${Date.now()}`}>
      {groupedMessages.map((item, index) => {
        if (item.type === 'date') {
          return (
            <div key={`date-${index}`} className="flex items-center justify-center my-4">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                {isToday(item.date)
                  ? 'Today'
                  : format(item.date, 'MMMM d, yyyy')}
              </div>
            </div>
          )
        }

        return (
          <div key={`group-${index}`} className="flex flex-col">
            {item.messages.map((message, msgIndex) => (
              <Message
                key={message.id || `${index}-${msgIndex}`}
                message={message}
                isOwn={message.senderId === currentUserId}
                showAvatar={msgIndex === item.messages.length - 1}
                showTime={msgIndex === item.messages.length - 1}
                senderName={senderName}
                onUpdate={onUpdateMessage}
                onDelete={onDeleteMessage}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default MessageList

