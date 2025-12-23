const Avatar = ({ name, isOnline, size = 'md' }) => {
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const indicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const colors = [
    'bg-primary-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-blue-500',
  ]

  // Generate consistent color based on name
  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length
    : 0

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colors[colorIndex]} text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      >
        {getInitials(name)}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizes[size]} ${
            isOnline === true || isOnline === 'true' ? 'bg-green-500' : 'bg-gray-400'
          } border-2 border-white dark:border-gray-800 rounded-full`}
        />
      )}
    </div>
  )
}

export default Avatar

