const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

const buttonVariants = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper',
  danger: 'bg-danger text-white hover:bg-[#8f1d13]',
  dangerOutline: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-white',
  success: 'bg-success text-white hover:bg-[#244a2d]',
  ghost: 'bg-transparent text-ink underline decoration-accent decoration-2 underline-offset-4 hover:bg-highlight/60',
}

const buttonSizes = {
  sm: 'min-h-10 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-4 py-2 text-base',
  lg: 'min-h-12 px-4 py-3 text-base',
}

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`.trim()
}
