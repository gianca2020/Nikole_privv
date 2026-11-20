// Primary actions are a rubber-ink stamp; everything else is pencil on paper.
// The look lives in journal.css (.stamp-btn, .pencil-btn, .ink-link).
const buttonVariants = {
  primary: 'stamp-btn',
  success: 'stamp-btn',
  danger: 'stamp-btn stamp-btn--danger',
  dangerOutline: 'pencil-btn pencil-btn--danger',
  secondary: 'pencil-btn',
  ghost: 'ink-link',
}

const buttonSizes = {
  sm: 'min-h-11 px-4 py-1.5 text-[13px]',
  md: 'min-h-11 px-5 py-2 text-[14px]',
  lg: 'min-h-12 px-6 py-3 text-[14px]',
}

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `${buttonVariants[variant]} ${buttonSizes[size]} disabled:cursor-not-allowed ${className}`.trim()
}
