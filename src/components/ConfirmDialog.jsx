import { createContext, useContext, useState, useCallback, useEffect, useId, useRef } from 'react'
import Button from './ui/Button'

const ConfirmContext = createContext()

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const [pending, setPending] = useState(false)

  // confirm(message, onConfirm, onCancel, { confirmLabel, pendingLabel })
  const confirm = useCallback((message, onConfirm, onCancel, options = {}) => {
    setDialog({
      message,
      onConfirm,
      onCancel,
      confirmLabel: options.confirmLabel || 'Delete',
      pendingLabel: options.pendingLabel || 'Working…',
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!dialog) return
    setPending(true)
    try {
      await dialog.onConfirm?.()
    } finally {
      setPending(false)
      setDialog(null)
    }
  }, [dialog])

  const handleCancel = useCallback(() => {
    dialog?.onCancel?.()
    setDialog(null)
  }, [dialog])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && (
        <ConfirmDialogModal
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          pendingLabel={dialog.pendingLabel}
          pending={pending}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}

// Native <dialog>: showModal() provides the focus trap, Esc handling, inert background,
// and returns focus to the triggering control on close. Cancel is first in DOM order,
// so it receives initial focus.
function ConfirmDialogModal({ message, confirmLabel, pendingLabel, pending, onConfirm, onCancel }) {
  const ref = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
    return () => {
      if (el?.open) el.close()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault()
        if (!pending) onCancel()
      }}
      className="surface-paper m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg bg-surface p-6 text-ink shadow-lg backdrop:bg-black/60"
    >
      <h2 id={titleId} className="font-serif text-xl font-bold mb-2">
        Please confirm
      </h2>
      <p id={messageId} className="text-ink-muted mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
