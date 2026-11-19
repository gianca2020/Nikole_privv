import { buttonClass } from './buttonStyles'

// Keyboard-reachable file input: the real input is visually hidden (not display:none)
// and the label shows a focus ring when the input has keyboard focus.
export default function FilePicker({ children, disabled, className = '', ...inputProps }) {
  return (
    <label className={`block ${className}`}>
      <input type="file" className="peer sr-only" disabled={disabled} {...inputProps} />
      <span
        className={`${buttonClass({ variant: 'primary', size: 'lg' })} w-full cursor-pointer peer-disabled:opacity-60 peer-disabled:cursor-not-allowed peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent`}
      >
        {children}
      </span>
    </label>
  )
}
