import { Globe } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

interface LanguageToggleProps {
  variant?: 'pill' | 'button' | 'minimal'
  className?: string
}

export function LanguageToggle({ variant = 'pill', className = '' }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage()

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white/90 hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-xs active:scale-95 transition-all ${className}`}
        title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="uppercase tracking-wider">{language}</span>
      </button>
    )
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 transition-colors ${className}`}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-stone-400" />
        <span className="uppercase text-[11px]">{language}</span>
      </button>
    )
  }

  // Default 'pill' variant: [ ID | EN ]
  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center p-0.5 rounded-full bg-stone-100 border border-stone-200/80 shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          language === 'id'
            ? 'bg-white text-stone-900 shadow-xs scale-100'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={language === 'id'}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          language === 'en'
            ? 'bg-white text-stone-900 shadow-xs scale-100'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  )
}
