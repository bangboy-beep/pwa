// SmartQR Customer Menu — Mobile Professional Design
// Route: /m/:slug
// Supports optional product videos with lazy loading and IntersectionObserver.

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '../lib/supabase/client'
import { Loading } from '../components/ui/Loading'
import { AlertCircle } from 'lucide-react'
import type { Business, MenuCategory, MenuProduct } from '../types'

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
]

function getRandomFoodImage(index: number): string {
  return FOOD_IMAGES[index % FOOD_IMAGES.length]
}

// Lazy video card — plays when visible via IntersectionObserver, fallback to image
function VideoProductCard({
  product,
  index,
}: {
  product: MenuProduct
  index: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [_isIntersecting, setIsIntersecting] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const observe = useCallback(() => {
    const el = cardRef.current
    const video = videoRef.current
    if (!el || !video || !product.video_url) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          video.play().catch(() => {})
        } else {
          setIsIntersecting(false)
          video.pause()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [product.video_url])

  useEffect(() => { observe() }, [observe])

  if (videoError || !product.video_url) {
    return <ProductImageCard product={product} index={index} />
  }

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* Video — no overlay, clean video display */}
      <div className="relative h-64 bg-stone-900">
        <video
          ref={videoRef}
          src={product.video_url}
          poster={product.image_url || undefined}
          muted
          loop
          playsInline
          preload="none"
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      </div>

      {/* Info — centered below video */}
      <div className="p-4 flex flex-col items-center text-center">
        <p className="font-semibold text-stone-900 text-[15px] leading-tight">{product.name}</p>
        {product.description && (
          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed w-full">{product.description}</p>
        )}
        {product.price > 0 && (
          <p className="text-amber-600 font-bold text-[15px] mt-2">
            Rp {product.price.toLocaleString('id-ID')}
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
  return (
    <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-4 hover:bg-stone-100 transition-colors group">
      <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-stone-200 shadow-sm">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
        ) : (
          <img src={getRandomFoodImage(index)} alt="" className="w-full h-full object-cover transition-transform duration-300" loading="lazy" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-[15px] leading-tight truncate">{product.name}</p>
        {product.description && (
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">{product.description}</p>
        )}
        {product.price > 0 && (
          <p className="text-amber-600 font-bold text-[15px] mt-1">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

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
          <h1 className="text-lg font-bold text-stone-900 mb-2">Menu Tidak Ditemukan</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || 'Bisnis yang Anda cari tidak tersedia.'}</p>
          <Link to={`/q/${slug || ''}`} className="inline-block px-5 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors w-full">
            Kembali ke Hub
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

        {/* Fixed Header — always visible at top */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 flex-shrink-0 bg-white sticky top-0 z-20">
          <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">Menu</h1>
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
              Semua
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
              <p className="text-stone-400 text-sm">Menu belum tersedia untuk bisnis ini.</p>
            </div>
          )}
        </div>

        {/* Fixed Footer — always visible at bottom */}
        <div className="p-5 text-center flex-shrink-0 border-t border-stone-100 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
            Powered by <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
