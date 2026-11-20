import { useId } from 'react'

const controlClass =
  'w-full px-3 py-2 rounded-sm bg-surface border border-ink/40 text-ink placeholder:text-ink-muted/70 aria-[invalid=true]:border-danger aria-[invalid=true]:border-2'

// Labelled form control. Accepts `as="textarea"`; pass `ref` to focus it programmatically.
// `required` is exposed as aria-required (not the native attribute) so the page's inline
// error handling runs instead of the browser's own bubble; type="url" still validates natively.
export default function Field({ label, hint, error, required, as = 'input', className = '', ...props }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const Control = as

  return (
    <div>
      <label htmlFor={id} className="block text-ink font-semibold mb-1">
        {label}
        {required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-ink-muted text-sm mb-2">
          {hint}
        </p>
      )}
      <Control
        id={id}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${controlClass} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-danger text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
