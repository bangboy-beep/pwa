// SmartQR Customer Hub — Mobile Professional Design
// Route: /q/:slug

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicBusinessBySlug } from '../lib/business/service'
import { getReviewSettings } from '../lib/review/service'
import { Loading } from '../components/ui/Loading'
import { Utensils, Wifi, Star, AlertCircle, ChevronRight } from 'lucide-react'
import type { PublicBusiness } from '../lib/business/service'

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

        // Fetch review URL for direct linking
        const { data: revData } = await getReviewSettings(data.id)
        if (revData?.google_review_url && revData.is_active) {
          setReviewUrl(revData.google_review_url)
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-5">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || 'Bisnis yang Anda cari tidak tersedia.'}</p>
          <a href="/" className="inline-block px-5 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors w-full">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      {/* Phone Frame */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden h-[92vh] flex flex-col relative animate-fade-in">

        {/* Hero Image Section */}
        <div className="relative h-48 shrink-0">
          {business.cover_url ? (
            <img src={business.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-stone-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Floating Profile Section */}
        <div className="relative px-6 flex flex-col items-center -mt-10 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-white rounded-[2rem] blur-[2px]" />
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="relative w-20 h-20 rounded-[1.75rem] object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="relative w-20 h-20 rounded-[1.75rem] bg-stone-900 text-white flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-2xl font-bold">{business.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-4">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">{business.name}</h1>
            {business.description && (
              <p className="text-stone-500 text-sm mt-1 max-w-[240px] leading-relaxed mx-auto">
                {business.description}
              </p>
            )}
          </div>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-12">
          {/* Menu Card */}
          <Link
            to={`/m/${slug}`}
            className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group"
          >
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm">Menu</p>
              <p className="text-stone-400 text-xs mt-0.5">Lihat daftar menu pilihan</p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* WiFi Card */}
          <Link
            to={`/w/${slug}`}
            className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wifi className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm">WiFi</p>
              <p className="text-stone-400 text-xs mt-0.5">Hubungkan ke akses internet</p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Google Review Card — langsung buka URL review jika tersedia */}
          {reviewUrl ? (
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm">Google Review</p>
                <p className="text-stone-400 text-xs mt-0.5">Bagikan pengalaman berharga Anda</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
            </a>
          ) : (
            <Link
              to={`/r/${slug}`}
              className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm">Google Review</p>
                <p className="text-stone-400 text-xs mt-0.5">Bagikan pengalaman berharga Anda</p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
            Powered by <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}

