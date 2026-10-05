// SmartQR Customer Google Review — Mobile Professional Design
// Route: /r/:slug

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '../lib/supabase/client'
import { Loading } from '../components/ui/Loading'
import { AlertCircle, Star, ExternalLink } from 'lucide-react'
import type { Business, ReviewSettings } from '../types'

export default function PublicReviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [review, setReview] = useState<ReviewSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!slug) { setError('Slug bisnis tidak valid'); setLoading(false); return }
      const supabase = createClient()
      try {
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single()
        if (bizError || !bizData) { setError('Bisnis tidak ditemukan'); setLoading(false); return }
        setBusiness(bizData as Business)
        const { data: revData, error: revError } = await supabase
          .from('business_reviews')
          .select('*')
          .eq('business_id', (bizData as Business).id)
          .eq('is_active', true)
          .single()
        if (!revError && revData) setReview(revData as ReviewSettings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-5">
        <div className="bg-white p-8 rounded-[1.25rem] shadow-sm border border-stone-100 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">Review Tidak Ditemukan</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || 'Halaman ulasan tidak tersedia.'}</p>
          <Link to={`/q/${slug || ''}`} className="inline-block px-5 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors w-full">
            Kembali ke Hub
          </Link>
        </div>
      </div>
    )
  }

  const hasReview = review?.google_review_url && review.is_active

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden h-[92vh] flex flex-col">

        {/* Back Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 shrink-0">
          <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">Google Review</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 space-y-5">

          {/* Star Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Star className="w-9 h-9 text-amber-500 fill-amber-500" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h2 className="text-base font-bold text-stone-900">Share Your Experience</h2>
            <p className="text-stone-400 text-xs mt-1.5 leading-relaxed max-w-[220px] mx-auto">
              Kami sangat menghargai ulasan Anda
            </p>
          </div>

          {/* Google Review Card */}
          <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-stone-100">
                <svg viewBox="0 0 48 48" className="w-6 h-6">
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm">Google Review</p>
                <p className="text-stone-400 text-xs mt-0.5 leading-snug">
                  Beri ulasan di Google Maps untuk membantu kami terus berkembang
                </p>
              </div>
            </div>

            {hasReview ? (
              <a
                href={review.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 rounded-2xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors text-center flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                Leave a Google Review
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-center py-4">
                <p className="text-stone-400 text-xs">Ulasan Google belum tersedia untuk bisnis ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 text-center shrink-0 border-t border-stone-100">
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
            Powered by <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
