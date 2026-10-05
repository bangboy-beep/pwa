import { cn } from './utils'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  type?: InputType
}

export function Input({
  label,
  error,
  helperText,
  className,
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#49454F] mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-transparent text-stone-900 placeholder-stone-400 transition-all focus:outline-none focus:ring-1',
            {
              'border-[#79747E] focus:border-[#f0883a] focus:ring-[#f0883a]': !error,
              'border-red-500 focus:border-red-500 focus:ring-red-500': error,
            },
            isPassword && 'pr-12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-stone-500">{helperText}</p>
      )}
    </div>
  )
}
