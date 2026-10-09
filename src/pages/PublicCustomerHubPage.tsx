// SmartQR Customer Hub — Android app style
// Route: /q/:slug

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicBusinessBySlug } from '../lib/business/service'
import { getReviewSettings } from '../lib/review/service'
import { Loading } from '../components/ui/Loading'
import { Utensils, Wifi, Star, AlertCircle, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PublicBusiness } from '../lib/business/service'

interface HubAction {
  title: string
  desc: string
  icon: LucideIcon
  tone: string
  to?: string
  href?: string
}

function ActionContent({ action }: { action: HubAction }) {
  return (
    <>
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${action.tone}`}>
        <action.icon className="w-6 h-6" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-bold text-ink">{action.title}</span>
        <span className="block text-xs text-ink-muted mt-0.5 truncate">{action.desc}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-ink-muted shrink-0" />
    </>
  )
}

export default function PublicCustomerHubPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewUrl, setReviewUrl] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!slug) {
        setError('Slug bisnis tidak valid')
        setLoading(false)
        return
      }
      try {
        const { data, error: bizError } = await getPublicBusinessBySlug(slug)
        if (bizError || !data || data.status !== 'active') {
          setError('Bisnis tidak ditemukan atau tidak tersedia')
          setLoading(false)
          return
        }
        setBusiness(data)
        const { data: revData } = await getReviewSettings(data.id)
        if (revData?.google_review_url && revData.is_active) {
          setReviewUrl(revData.google_review_url)
        }
      } catch {
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-5">
        <div className="bg-white p-6 rounded-[28px] max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-extrabold text-ink mb-1">Halaman Tidak Ditemukan</h1>
          <p className="text-ink-muted text-sm leading-relaxed">{error || 'Bisnis yang Anda cari tidak tersedia.'}</p>
        </div>
      </div>
    )
  }

  const actions: HubAction[] = [
    { title: 'Lihat Menu', desc: 'Daftar makanan & minuman', icon: Utensils, tone: 'bg-primary-100 text-primary-800', to: `/m/${slug}` },
    { title: 'Sambung WiFi', desc: 'Akses internet gratis', icon: Wifi, tone: 'bg-sky-100 text-sky-800', to: `/w/${slug}` },
    reviewUrl
      ? { title: 'Beri Ulasan', desc: 'Bagikan pengalaman Anda di Google', icon: Star, tone: 'bg-amber-100 text-amber-800', href: reviewUrl }
      : { title: 'Beri Ulasan', desc: 'Bagikan pengalaman Anda di Google', icon: Star, tone: 'bg-amber-100 text-amber-800', to: `/r/${slug}` },
  ]

  const itemClass =
    'flex items-center gap-4 p-3 pr-4 bg-white rounded-3xl shadow-[0_2px_12px_rgba(23,22,31,0.05)] active:scale-[0.98] transition-transform'

  return (
    <div className="min-h-[100dvh] bg-surface">
      <div className="max-w-md mx-auto min-h-[100dvh] flex flex-col">
        {/* Cover */}
        <div className="relative h-52 shrink-0 bg-primary-100">
          {business.cover_url ? (
            <img src={business.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Profile sheet */}
        <div className="relative -mt-8 flex-1 bg-surface rounded-t-[32px] px-4 pt-0 animate-fade-in">
          <div className="flex flex-col items-center -mt-11">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-[88px] h-[88px] rounded-[28px] object-cover border-4 border-surface shadow-lg bg-white"
              />
            ) : (
              <div className="w-[88px] h-[88px] rounded-[28px] bg-ink text-white flex items-center justify-center border-4 border-surface shadow-lg">
                <span className="text-3xl font-extrabold">{business.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <h1 className="mt-3 text-2xl font-extrabold text-ink tracking-tight text-center text-balance">{business.name}</h1>
            {business.description && (
              <p className="text-ink-muted text-sm mt-1 max-w-[280px] text-center leading-relaxed text-pretty">
                {business.description}
              </p>
            )}
            <span className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Buka untuk Anda
            </span>
          </div>

          <h2 className="mt-7 mb-3 px-1 text-sm font-bold text-ink">Apa yang Anda butuhkan?</h2>
          <nav className="space-y-3" aria-label="Layanan">
            {actions.map((action) =>
              action.href ? (
                <a key={action.title} href={action.href} target="_blank" rel="noopener noreferrer" className={itemClass}>
                  <ActionContent action={action} />
                </a>
              ) : (
                <Link key={action.title} to={action.to!} className={itemClass}>
                  <ActionContent action={action} />
                </Link>
              )
            )}
          </nav>

          <p className="py-8 text-center text-[11px] font-semibold text-ink-muted/70">
            Powered by <span className="text-ink-muted">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
