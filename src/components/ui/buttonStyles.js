const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

const buttonVariants = {
  primary: 'bg-accent text-white hover:bg-[#6a001b]',
  secondary: 'bg-surface text-ink border border-rule hover:bg-paper',
  danger: 'bg-danger text-white hover:bg-[#8f1d13]',
  dangerOutline: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-white',
  success: 'bg-success text-white hover:bg-[#175530]',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-base',
}

export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`.trim()
}
