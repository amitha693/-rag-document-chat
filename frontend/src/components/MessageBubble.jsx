export default function MessageBubble({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-xl rounded-2xl px-4 py-3 
        ${isUser
          ? "bg-blue-600 text-white"
          : "bg-white border border-gray-200 text-gray-800"}`}>

        {/* Message text */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {/* Citations — only for assistant messages */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-1">
              📄 Sources
            </p>
            {message.sources.map((src, i) => (
              <p key={i} className="text-xs text-blue-500">
                {src}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}