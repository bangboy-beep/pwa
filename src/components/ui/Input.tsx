import { cn } from './utils'
import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

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
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const generatedId = useId()
  const inputId = id || generatedId
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink-muted mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          className={cn(
            'w-full h-12 px-4 rounded-2xl border-2 bg-surface text-ink placeholder:text-ink-muted/60 transition-all focus:outline-none focus:bg-white',
            error ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-primary',
            isPassword && 'pr-12',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-ink-muted hover:bg-primary-50"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 ml-1 text-xs font-medium text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 ml-1 text-xs text-ink-muted">{helperText}</p>}
    </div>
  )
}
