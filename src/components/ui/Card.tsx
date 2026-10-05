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
        'bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden',
        onClick && 'cursor-pointer active:scale-[0.99] hover:bg-stone-50 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}
