import { Loader2 } from 'lucide-react'
import { cn } from './utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tonal'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        {
          primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/30',
          secondary: 'bg-ink text-white hover:bg-ink/90',
          tonal: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
          outline: 'border border-outline text-ink hover:bg-primary-50',
          ghost: 'text-ink-muted hover:text-ink hover:bg-primary-50',
        }[variant],
        {
          sm: 'px-4 text-xs h-9',
          md: 'px-5 text-sm h-11',
          lg: 'px-6 text-base h-[52px]',
        }[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
