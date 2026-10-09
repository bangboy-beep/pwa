import { cn } from './utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-3xl shadow-[0_1px_2px_rgba(23,22,31,0.04),0_4px_16px_rgba(23,22,31,0.04)] overflow-hidden',
        onClick && 'cursor-pointer active:scale-[0.99] hover:bg-primary-50/40 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}
