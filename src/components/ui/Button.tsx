import { cn } from './utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
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
        'inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-colors',
        {
          'primary': 'bg-[#f0883a] text-white hover:bg-[#e07b2f] shadow-sm',
          'secondary': 'bg-stone-800 text-white hover:bg-stone-900 shadow-sm',
          'outline': 'border border-stone-300 text-stone-700 hover:bg-stone-50',
          'ghost': 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
        }[variant],
        {
          'sm': 'px-3 py-1.5 text-xs rounded-lg h-9',
          'md': 'px-4 py-2.5 text-sm rounded-xl h-11',
          'lg': 'px-6 py-3 text-base rounded-xl h-[52px]',
        }[size],
        isLoading && 'pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
