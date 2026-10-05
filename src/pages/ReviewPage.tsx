// SmartQR Google Review Management — Storyboard Screen 6
// Route: /admin/review
// Visual redesign only — all functionality preserved.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBusiness } from '../providers/BusinessProvider'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { getReviewSettings, updateReviewSettings } from '../lib/review/service'
import { Loading } from '../components/ui/Loading'
import { useToast } from '../hooks/useToast'
import { cn } from '../components/ui/utils'
import {
  Star,
} from 'lucide-react'

export default function ReviewPage() {
  const { businessId: routeBusinessId } = useParams<{ businessId?: string }>()
  const { businesses, selectedBusiness } = useBusiness()
  const { showToast } = useToast()
  useAuthGuard()

  const currentBusiness = routeBusinessId
    ? businesses.find((b) => b.id === routeBusinessId) || selectedBusiness
    : selectedBusiness || businesses[0] || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [googleReviewUrl, setGoogleReviewUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const role = currentBusiness?.role || 'staff'
  const isReadOnly = role === 'staff'

  useEffect(() => {
    async function load() {
      if (!currentBusiness) { setLoading(false); return }
      setLoading(true)
      const { data, error } = await getReviewSettings(currentBusiness.id)
      if (error && error.message && !error.message.includes('No rows found')) console.error(error)
      else if (data) { setGoogleReviewUrl(data.google_review_url || ''); setIsActive(data.is_active) }
      else { setGoogleReviewUrl(''); setIsActive(true) }
      setLoading(false)
    }
    load()
  }, [currentBusiness])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBusiness || isReadOnly) return
    if (!googleReviewUrl.trim()) { showToast('error', 'URL Google Review wajib diisi'); return }
    setSaving(true)
    const { error } = await updateReviewSettings(currentBusiness.id, { google_review_url: googleReviewUrl.trim(), is_active: isActive })
    setSaving(false)
    if (error) showToast('error', error.message || 'Gagal menyimpan pengaturan ulasan')
    else showToast('success', 'Pengaturan Google Review berhasil disimpan!')
  }


  if (loading) return <Loading />
  if (!currentBusiness) return <div className="p-12 text-center text-stone-500">Bisnis tidak ditemukan</div>

  return (
    <div className="w-full space-y-5 pb-4">

      {/* ── STATUS PILL (compact, centered) ── */}
      <div
        className={cn(
          "rounded-xl px-4 py-3 flex items-center justify-between border transition-all duration-300",
          isActive
            ? "bg-orange-50 border-orange-200"
            : "bg-stone-50 border-stone-200"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            isActive ? "bg-[#f0883a] text-white" : "bg-stone-200 text-stone-400"
          )}>
            <Star className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className={cn(
              "font-bold text-[14px] leading-tight truncate",
              isActive ? "text-stone-900" : "text-stone-500"
            )}>
              Google Review
            </p>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isActive ? "text-[#f0883a]" : "text-stone-400"
            )}>
              {isActive ? 'Link Aktif' : 'Link Nonaktif'}
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f0883a]" />
          </label>
        )}
      </div>

      {/* ── SETTINGS — no card container ── */}
      <div className="space-y-4 pt-4">

        {/* URL input */}
        <div className="relative">
          <input
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://search.google.com/local/writereview?placeid=..."
            disabled={isReadOnly}
            className="w-full h-[48px] min-w-0 max-w-full box-border pl-4 pr-14 rounded-lg border border-[#79747E] text-sm bg-white text-stone-900 focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all disabled:opacity-60"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white pl-1">
          </div>
        </div>
        <p className="text-[10px] text-stone-400 ml-1 leading-relaxed">
          Pelanggan akan diarahkan ke link ini setelah scan QR atau klik tombol ulasan.
        </p>

        {/* Save button — directly below, no card */}
        <div className="flex justify-center pt-1">
          {!isReadOnly ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 h-[48px] rounded-full bg-[#f0883a] text-white text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-orange-200"
            >
              {saving && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Simpan Link
            </button>
          ) : (
            <p className="text-xs text-stone-400 text-center font-medium">
              Hanya owner atau admin yang dapat mengubah pengaturan.
            </p>
          )}
        </div>
      </div>

      {/* ── TIPS ── */}
      {googleReviewUrl && (
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-white shadow-xs">
            💡
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[15px] font-bold text-stone-900 mb-1">Tips untuk Anda</h4>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Bagikan link ini melalui WhatsApp atau media sosial agar pelanggan lebih mudah memberikan ulasan positif untuk bisnis Anda.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}