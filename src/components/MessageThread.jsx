function MessageThread({ messages, isMine, emptyText = 'No messages yet.' }) {
  if (messages.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">{emptyText}</p>
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        if (message.isSystem) {
          return (
            <div key={message.id} className="flex justify-center">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                {message.content}
              </span>
            </div>
          )
        }

        const mine = isMine(message)
        return (
          <div
            key={message.id}
            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                mine ? 'bg-primary text-white' : 'bg-accent-mist text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MessageThread
