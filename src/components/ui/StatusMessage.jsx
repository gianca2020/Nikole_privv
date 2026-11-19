import Button from './Button'

// Distinct loading / empty / error states so a failed load never reads as "no data".
export default function StatusMessage({ kind, message, actionLabel, onAction }) {
  const defaults = { loading: 'Loading…', empty: 'Nothing here yet.', error: 'Something went wrong.' }
  const text = message || defaults[kind]

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center gap-4 py-12 text-center"
    >
      <p className={kind === 'error' ? 'text-white text-lg' : 'text-white/70 text-lg'}>{text}</p>
      {actionLabel && onAction && kind !== 'loading' && (
        <Button variant={kind === 'error' ? 'secondary' : 'primary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
