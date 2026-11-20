import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++nextId.current
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// The live region stays mounted so screen readers announce toasts as they are added.
function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 right-4 left-4 lg:bottom-4 sm:left-auto z-50 space-y-2 pointer-events-none"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const [paused, setPaused] = useState(false)

  // Auto-dismiss, paused while the pointer or keyboard focus is on the toast.
  useEffect(() => {
    if (toast.duration <= 0 || paused) return
    const timer = setTimeout(() => onRemove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [paused, toast.duration, toast.id, onRemove])

  const accent = {
    success: 'border-l-success',
    error: 'border-l-danger',
    info: 'border-l-ink-muted',
  }[toast.type] || 'border-l-ink-muted'

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`slip border-l-8 ${accent} px-4 py-3 pointer-events-auto flex items-center gap-2 sm:ml-auto sm:max-w-md`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onRemove(toast.id)}
        className="min-h-10 min-w-10 px-2 py-1 text-ink-muted hover:text-ink"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}
