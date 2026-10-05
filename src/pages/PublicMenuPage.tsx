// SmartQR Customer Menu — Mobile Professional Design
// Route: /m/:slug

import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-stone-50 py-8 px-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden h-[92vh] flex flex-col">

        {/* Back Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 shrink-0">
          <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">Menu</h1>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4 pb-3 overflow-x-auto scrollbar-hide shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-base font-bold transition-all ${activeCategory === null
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
                className={`shrink-0 px-4 py-2 rounded-full text-base font-bold transition-all ${activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {(activeCategory
            ? productsByCategory.filter(({ category }) => category.id === activeCategory)
            : productsByCategory
          ).map(({ category, items }, catIndex) => (
            <section key={category.id}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-stone-900 rounded-full" />
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">{category.name}</h2>
              </div>

              <div className="space-y-8">
                {items.map((product, idx) => (
                  <div key={product.id} className="flex items-center gap-4 bg-stone-50 rounded-2xl p-4 hover:bg-stone-100 transition-colors group">
                    <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-stone-200 shadow-sm">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <img src={getRandomFoodImage(catIndex * 4 + idx)} alt="" className="w-full h-full object-cover transition-transform duration-300" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-[15px] leading-tight truncate">{product.name}</p>
                      {product.price > 0 && (
                        <p className="text-amber-600 font-bold text-[15px] mt-1">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
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
