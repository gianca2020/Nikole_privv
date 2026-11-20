import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'
import { useConfirm } from '../components/ConfirmDialog'

// Warns before leaving a page with unsaved edits (in-app navigation and tab close).
// Call the returned `allowNavigation()` right before navigating away after a successful save.
export default function useUnsavedChangesGuard(isDirty) {
  const { confirm } = useConfirm()
  const dirtyRef = useRef(isDirty)
  const allowRef = useRef(false)
  dirtyRef.current = isDirty

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && !allowRef.current && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    confirm(
      'You have unsaved changes. Leave without saving?',
      () => blocker.proceed(),
      () => {
        blocker.reset()
        // Lets the notebook turn a hand-dragged page back to the section that is still open.
        window.dispatchEvent(new Event('journal:nav-cancelled'))
      },
      { confirmLabel: 'Leave', pendingLabel: 'Leaving…' }
    )
  }, [blocker, confirm])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return {
    allowNavigation() {
      allowRef.current = true
    },
  }
}
