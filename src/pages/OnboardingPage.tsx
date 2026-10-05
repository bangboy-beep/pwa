// SmartQR Onboarding Page — Mobile-First Design

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBusiness } from '../providers/BusinessProvider'
import { useAuthContext } from '../hooks/useAuthContext'
import { Loading } from '../components/ui/Loading'
import { createBusiness } from '../lib/business/service'
import type { BusinessType } from '../types'
import { Plus } from 'lucide-react'

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restoran', icon: '🍽️' },
  { value: 'cafe', label: 'Kafe', icon: '☕' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'homestay', label: 'Homestay', icon: '🏠' },
  { value: 'villa', label: 'Villa', icon: '🏡' },
  { value: 'bar', label: 'Bar', icon: '🍸' },
  { value: 'salon', label: 'Salon', icon: '💇' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'other', label: 'Lainnya', icon: '📋' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { businesses, loading, refetch, setSelectedBusiness } = useBusiness()
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) { setError('Mohon isi semua field yang wajib.'); return }
    const urlSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setIsCreating(true); setError(null)
    const { data, error: createError } = await createBusiness({ name: name.trim(), slug: urlSlug, business_type: businessType })
    setIsCreating(false)
    if (createError) { setError(createError.message || 'Gagal membuat bisnis'); return }
    if (data) { await refetch(); navigate('/admin') }
  }

  const handleSelect = (businessId: string) => {
    const match = businesses.find((b) => b.id === businessId)
    if (match) setSelectedBusiness(match)
    navigate('/admin')
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top gradient brand */}
      <div className="bg-gradient-to-b from-amber-500 to-orange-400 pt-10 pb-8 px-5 text-center">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-3">
          <Plus className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-extrabold text-white">Selamat Datang</h1>
        <p className="text-amber-100 text-sm mt-1">Siapkan bisnis Anda untuk memulai</p>
      </div>

      <div className="px-4 -mt-4 pb-8 space-y-4">
        {/* Existing Businesses */}
        {businesses.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">Bisnis Anda</p>
            <div className="space-y-2">
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleSelect(biz.id)}
                  className="w-full p-3.5 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md text-left transition-all active:scale-[0.98] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                    {BUSINESS_TYPES.find(t => t.value === biz.business_type)?.icon || '📋'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900 text-sm">{biz.name}</p>
                    <p className="text-xs text-stone-400">smartqr.app/{biz.slug}</p>
                  </div>
                  <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create New Business */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-stone-900 mb-4">Buat Bisnis Baru</h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">Nama Bisnis *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Cafe Kopi Senja"
                required
                className="w-full h-11 px-4 rounded-xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 bg-stone-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">URL Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="contoh-kopi-senja"
                required
                className="w-full h-11 px-4 rounded-xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 bg-stone-50 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-stone-400 mt-1.5">Akan menjadi bagian dari URL publik Anda</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Tipe Bisnis</label>
              <div className="grid grid-cols-3 gap-2">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBusinessType(type.value)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all active:scale-95 ${
                      businessType === type.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className="text-[11px] font-bold text-stone-700">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim() || !slug.trim()}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Membuat...</>
              ) : (
                <><Plus className="w-4 h-4" /> Buat Bisnis</>
              )}
            </button>
          </div>
        </div>

        {!user && (
          <div className="text-center text-xs text-stone-400">
            Silakan <a href="/admin/login" className="text-amber-600 hover:underline font-bold">masuk</a> terlebih dahulu
          </div>
        )}
      </div>
    </div>
  )
}
