import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Check, CheckCheck, Trash2 } from 'lucide-react'
import Avatar from './Avatar'

const Message = ({ message, isOwn, showAvatar, showTime, senderName, onUpdate, onDelete }) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const messageRef = useRef(null)
  const contextMenuRef = useRef(null)
  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      return format(new Date(timeString), 'HH:mm')
    } catch {
      return ''
    }
  }

  const getMessageStateIcon = () => {
    if (!isOwn) return null
    
    switch (message.state) {
      case 'SENT':
        return <Check className="w-4 h-4 text-gray-400" />
      case 'SEEN':
        return <CheckCheck className="w-4 h-4 text-primary-600" />
      default:
        return <Check className="w-4 h-4 text-gray-400" />
    }
  }

  const renderContent = () => {
    if (message.content === "This message was deleted") {
      return <p className="text-gray-500 dark:text-gray-400 italic">{message.content}</p>
    }
    
    if (message.type === 'IMAGE') {
      const hasMedia = message.media && (
        (Array.isArray(message.media) && message.media.length > 0) ||
        (typeof message.media === 'string' && message.media.length > 0)
      )
      
      if (!hasMedia) {
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <span className="text-lg">🖼️</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">Image</span>
          </div>
        )
      }
      
      let imageUrl = null
      try {
        if (typeof message.media === 'string') {
          if (message.media.startsWith('data:')) {
            imageUrl = message.media
          } else {
            imageUrl = `data:image/jpeg;base64,${message.media}`
          }
        } else if (Array.isArray(message.media) && message.media.length > 0) {
          const uint8Array = new Uint8Array(message.media)
          const blob = new Blob([uint8Array], { type: 'image/jpeg' })
          imageUrl = URL.createObjectURL(blob)
        } else if (message.media instanceof Uint8Array && message.media.length > 0) {
          const blob = new Blob([message.media], { type: 'image/jpeg' })
          imageUrl = URL.createObjectURL(blob)
        }
      } catch (error) {
        console.error('Error processing image:', error)
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <span className="text-lg">🖼️</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">Image (failed to load)</span>
          </div>
        )
      }
      
      if (imageUrl) {
        return (
          <img
            src={imageUrl}
            alt="Shared image"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
            onClick={() => window.open(imageUrl, '_blank')}
            onError={(e) => {
              console.error('Image load error:', e)
              e.target.style.display = 'none'
            }}
          />
        )
      }
      
      return (
        <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
          <span className="text-lg">🖼️</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">Image</span>
        </div>
      )
    }
    
    
    if (message.type === 'FILE') {
      const getFileIcon = (fileName) => {
        if (!fileName) return '📎'
        const lowerName = fileName.toLowerCase()
        if (lowerName.includes('.pdf')) return '📄'
        if (lowerName.includes('.doc') || lowerName.includes('.docx')) return '📝'
        if (lowerName.includes('.xls') || lowerName.includes('.xlsx')) return '📊'
        if (lowerName.includes('.zip') || lowerName.includes('.rar') || lowerName.includes('.7z')) return '📦'
        if (lowerName.includes('.txt')) return '📄'
        return '📎'
      }
      
      let fileUrl = null
      let fileName = message.content || 'File attachment'
      const hasMedia = message.media && (
        (Array.isArray(message.media) && message.media.length > 0) ||
        (typeof message.media === 'string' && message.media.length > 0)
      )
      
      if (hasMedia) {
        try {
          if (Array.isArray(message.media) && message.media.length > 0) {
            const uint8Array = new Uint8Array(message.media)
            const blob = new Blob([uint8Array], { type: 'application/octet-stream' })
            fileUrl = URL.createObjectURL(blob)
          } else if (typeof message.media === 'string' && message.media.length > 0) {
            if (message.media.startsWith('data:')) {
              fileUrl = message.media
            } else {
              fileUrl = `data:application/octet-stream;base64,${message.media}`
            }
          }
        } catch (error) {
          console.error('Error processing file:', error)
        }
      }
      
      return (
        <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg min-w-[200px]">
          <span className="text-lg flex-shrink-0">{getFileIcon(fileName)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{fileName}</p>
            {fileUrl ? (
              <a 
                href={fileUrl} 
                download={fileName}
                className="text-primary-600 dark:text-primary-400 hover:underline text-xs mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                Download file
              </a>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">File attachment</p>
            )}
          </div>
        </div>
      )
    }

    if (message.type === 'AUDIO') {
      let audioUrl = null
      const hasMedia = message.media && (
        (Array.isArray(message.media) && message.media.length > 0) ||
        (typeof message.media === 'string' && message.media.length > 0)
      )
      
      if (hasMedia) {
        try {
          if (Array.isArray(message.media) && message.media.length > 0) {
            const uint8Array = new Uint8Array(message.media)
            let mimeType = 'audio/webm'
            if (message.content) {
              const lowerContent = message.content.toLowerCase()
              if (lowerContent.includes('.mp3')) mimeType = 'audio/mpeg'
              else if (lowerContent.includes('.wav')) mimeType = 'audio/wav'
              else if (lowerContent.includes('.ogg')) mimeType = 'audio/ogg'
              else if (lowerContent.includes('.m4a')) mimeType = 'audio/mp4'
            }
            const blob = new Blob([uint8Array], { type: mimeType })
            audioUrl = URL.createObjectURL(blob)
          } else if (typeof message.media === 'string' && message.media.length > 0) {
            if (message.media.startsWith('data:')) {
              audioUrl = message.media
            } else {
              audioUrl = `data:audio/webm;base64,${message.media}`
            }
          }
        } catch (error) {
          console.error('Error processing audio:', error)
        }
      }
      
      if (audioUrl) {
        return (
          <div className="flex items-center space-x-2">
            <audio controls className="max-w-xs" preload="metadata">
              <source src={audioUrl} type="audio/webm" />
              <source src={audioUrl} type="audio/mpeg" />
              <source src={audioUrl} type="audio/wav" />
              <source src={audioUrl} type="audio/ogg" />
              <source src={audioUrl} type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )
      }
      
      const audioName = message.content || 'Audio recording'
      return (
        <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg min-w-[200px]">
          <span className="text-lg flex-shrink-0">🎵</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{audioName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Audio message</p>
          </div>
        </div>
      )
    }

    return <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">{message.content}</p>
  }

  const getSenderName = () => {
    if (senderName) return senderName
    if (message.senderName) return message.senderName
    if (message.senderFirstName && message.senderLastName) {
      return `${message.senderFirstName} ${message.senderLastName}`
    }
    if (message.senderFirstName) return message.senderFirstName
    if (message.senderEmail) return message.senderEmail
    if (message.senderId && message.senderId.length > 20) {
      return 'User'
    }
    return message.senderId || 'User'
  }

  const handleDelete = () => {
    if (message.content === "This message was deleted") return
    if (window.confirm('Are you sure you want to delete this message?') && onDelete) {
      onDelete(message.id)
    }
  }

  const handleContextMenu = (e) => {
    if (!isOwn || message.content === "This message was deleted") return
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  const handleDeleteFromMenu = () => {
    handleDelete()
    setShowContextMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target) &&
          messageRef.current && !messageRef.current.contains(event.target)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showContextMenu])

  return (
    <div 
      ref={messageRef}
      className={`flex items-end space-x-2 mb-2 group ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
      onContextMenu={handleContextMenu}
    >
      {showAvatar && !isOwn && (
        <Avatar name={getSenderName()} size="sm" />
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} relative`}>
        {showContextMenu && isOwn && message.content !== "This message was deleted" && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 min-w-[120px]"
            style={{
              left: `${Math.min(contextMenuPosition.x, window.innerWidth - 150)}px`,
              top: `${Math.min(contextMenuPosition.y, window.innerHeight - 100)}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDeleteFromMenu}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
        <div
          className={`px-5 py-3.5 rounded-2xl relative ${
            isOwn
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm'
          }`}
        >
          {renderContent()}
        </div>
        
        {showTime && (
          <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <span>{formatTime(message.createdAt)}</span>
            {getMessageStateIcon()}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message

