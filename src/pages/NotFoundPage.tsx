import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

export default function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="pill" />
      </div>

      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-6">
          <AlertTriangle className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          {t('notFound', 'code')}
        </h1>
        <p className="text-xl text-stone-600 mb-8">
          {t('notFound', 'title')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          {t('notFound', 'goHome')}
        </Link>
      </div>
    </div>
  )
}
