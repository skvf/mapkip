import { useRef, useState } from 'react'

export default function Comment({
  messages = [],
  onSend = () => {},
  title = 'Chat',
  placeholder = 'Type your comment here...',
  showHeader = true,
  className = '',
}) {
  const [text, setText] = useState('')
  const messagesEndRef = useRef(null)

  function handleSend(e) {
    e && e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e) {
    // Enter envia, Shift+Enter insere quebra
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`card shadow-sm ${className}`}>
      {showHeader && (
        <div className="card-header d-flex align-items-center">
          <h6 className="mb-0">{title}</h6>
        </div>
      )}

      <div className="card-body d-flex flex-column p-3">
        <div className="overflow-auto mb-3 flex-grow-1">
          <div className="d-flex flex-column">
            {messages.length === 0 && (
              <div className="text-center text-muted small mt-3">No comments yet.</div>
            )}

            {messages.map((m) => (
              <div
                key={m._id}
                className={`d-flex mb-2 ${m.fromMe ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div style={{ maxWidth: '75%' }}>
                  {!m.fromMe && (
                    <div className="small text-muted">{m.author || 'Anonymous Author'}</div>
                  )}

                  <div
                    className={`p-2 rounded-3 ${m.fromMe ? 'border text-dark' : 'bg-light text-dark'}`}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {m.text}
                      <div className="small text-muted mt-1">
                        {m.author || 'Anonymous Author'} • {m.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="mt-auto">
          <div className="mb-2">
            <textarea
              className="form-control resize-none"
              placeholder={placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              style={{ maxHeight: 120 }}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Enviar
          </button>
          <div className="d-flex justify-content-between mt-2 small text-muted">
            <div>Type ENTER to send (Shift+Enter new line)</div>
          </div>
        </form>
      </div>
    </div>
  )
}
