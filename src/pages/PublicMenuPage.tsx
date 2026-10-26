// SmartQR Customer Menu — Mobile Professional Design
// Route: /m/:slug
// Supports optional product videos with lazy loading and IntersectionObserver.

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '../lib/supabase/client'
import { Loading } from '../components/ui/Loading'
import { AlertCircle, Sparkles, Video as VideoIcon } from 'lucide-react'
import type { Business, MenuCategory, MenuProduct } from '../types'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
]

function getRandomFoodImage(index: number): string {
  return FOOD_IMAGES[index % FOOD_IMAGES.length]
}

// True Lazy Video Card — src hanya dipasang saat masuk viewport, transisi mulus dari poster foto
function VideoProductCard({
  product,
  index,
}: {
  product: MenuProduct
  index: number
}) {
  const { formatPrice } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const posterImage = product.image_url || getRandomFoodImage(index)

  const observe = useCallback(() => {
    const el = cardRef.current
    if (!el || !product.video_url) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current
        if (entry.isIntersecting) {
          // Masuk layar: load video dan mulai play
          setShouldLoad(true)
          if (video) {
            video.play().catch(() => {})
          }
        } else {
          // Keluar layar: pause segera agar hemat GPU & memori HP
          if (video) {
            video.pause()
          }
        }
      },
      { threshold: 0.3, rootMargin: '80px 0px 80px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [product.video_url])

  useEffect(() => {
    const cleanup = observe()
    return () => {
      if (cleanup) cleanup()
    }
  }, [observe])

  useEffect(() => {
    if (shouldLoad && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [shouldLoad])

  if (videoError || !product.video_url) {
    return <ProductImageCard product={product} index={index} />
  }

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm active:scale-[0.99] transition-all relative group"
    >
      {/* Video Container — True Lazy Loading */}
      <div className="relative h-64 bg-stone-100 overflow-hidden">
        {/* Poster Image: Instan muncul tanpa delay, tidak ada lagi kotak hitam kosong */}
        <img
          src={posterImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isVideoPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Video Element: src HANYA diinjeksi saat kartu mulai masuk layar */}
        {shouldLoad && (
          <video
            ref={videoRef}
            src={product.video_url}
            poster={posterImage}
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setIsVideoPlaying(true)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badge Menu Spesial */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Menu Spesial</span>
        </div>

        {/* Video Icon Indicator */}
        <div className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white">
          <VideoIcon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Info — centered below video */}
      <div className="p-4 flex flex-col items-center text-center">
        <p className="font-bold text-stone-900 text-[16px] leading-tight">{product.name}</p>
        {product.description && (
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed w-full">{product.description}</p>
        )}
        {product.price > 0 && (
          <p className="text-primary-600 font-extrabold text-[16px] mt-2">
            {formatPrice(product.price)}
          </p>
        )}
      </div>
    </div>
  )
}

function ProductImageCard({
  product,
  index,
}: {
  product: MenuProduct
  index: number
}) {
  const { formatPrice } = useLanguage()

  return (
    <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-4 hover:bg-stone-100 transition-colors group">
      <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-stone-200 shadow-sm">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" />
        ) : (
          <img src={getRandomFoodImage(index)} alt="" className="w-full h-full object-cover transition-transform duration-300" loading="lazy" decoding="async" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-[15px] leading-tight truncate">{product.name}</p>
        {product.description && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{product.description}</p>
        )}
        {product.price > 0 && (
          <p className="text-primary-600 font-bold text-[15px] mt-1">
            {formatPrice(product.price)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useLanguage()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!slug) { setError(t('publicHub', 'invalidSlug')); setLoading(false); return }
      const supabase = createClient()
      try {
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single()
        if (bizError || !bizData) { setError(t('publicMenu', 'notFoundDesc')); setLoading(false); return }
        setBusiness(bizData as Business)
        const { data: catData } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('business_id', (bizData as Business).id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        const { data: prodData } = await supabase
          .from('menu_products')
          .select('*')
          .eq('business_id', (bizData as Business).id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        setCategories((catData as MenuCategory[]) || [])
        setProducts((prodData as MenuProduct[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common', 'error'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, t])

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
        <div className="bg-white p-8 rounded-[1.25rem] shadow-sm border border-stone-100 max-w-sm w-full text-center relative">
          <div className="absolute top-4 right-4">
            <LanguageToggle variant="button" />
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">{t('publicMenu', 'notFoundTitle')}</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || t('publicMenu', 'notFoundDesc')}</p>
          <Link to={`/q/${slug || ''}`} className="inline-block px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors w-full">
            {t('nav', 'backToHub')}
          </Link>
        </div>
      </div>
    )
  }

  const productsByCategory = categories
    .map(cat => ({
      category: cat,
      items: (products as MenuProduct[]).filter(p => p.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter(g => g.items.length > 0)

  const allCategories = productsByCategory.map(g => g.category)

  return (
    <div className="fixed inset-0 bg-stone-50 flex flex-col items-center justify-center p-4">
      {/* Outer wrapper: fixed viewport height, no scroll allowed */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white h-[92vh] flex flex-col relative">

        {/* Fixed Header with Language Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all" aria-label={t('common', 'back')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-base font-bold text-stone-900">{t('publicMenu', 'title')}</h1>
          </div>
          <LanguageToggle variant="minimal" />
        </div>

        {/* Fixed Tabs — always visible, never scrolls */}
        <div className="px-6 pt-3 pb-3 overflow-x-auto scrollbar-hide flex-shrink-0 bg-white border-b border-stone-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === null
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
            >
              {t('publicMenu', 'allTab')}
            </button>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Menu Content ONLY */}
        <div className="flex-1 overflow-y-auto min-h-0 -webkit-overflow-scrolling: touch px-6 py-5">
          {(activeCategory
            ? productsByCategory.filter(({ category }) => category.id === activeCategory)
            : productsByCategory
          ).map(({ category, items }, catIndex) => (
            <section key={category.id} className="mb-8">
              {/* Category Header — sticks to top of scroll area */}
              <div className="sticky top-0 bg-white z-10 flex items-center gap-2 mb-5 pb-3 border-b border-stone-200">
                <div className="w-1 h-6 bg-stone-900 rounded-full" />
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">{category.name}</h2>
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                {items.map((product, idx) => (
                  <div key={product.id}>
                    {product.video_url ? (
                      <VideoProductCard product={product} index={catIndex * 10 + idx} />
                    ) : (
                      <ProductImageCard product={product} index={catIndex * 10 + idx} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {productsByCategory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">{t('publicMenu', 'emptyMenu')}</p>
            </div>
          )}
        </div>

        {/* Fixed Footer — always visible at bottom */}
        <div className="p-5 text-center flex-shrink-0 border-t border-stone-100 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
            {t('common', 'poweredBy')} <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
