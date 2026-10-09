import { useEffect, useState } from 'react'
import { UtensilsCrossed, AlertCircle } from 'lucide-react'
import { getPublicMenu } from '../../lib/menu/service'
import { formatCurrency } from '../../lib/utils/format'
import type { MenuCategory, MenuProduct } from '../../types'

interface PublicMenuSectionProps {
  businessId: string
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !src) return null

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200/60">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function PublicMenuSection({ businessId }: PublicMenuSectionProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  useEffect(() => {
    let isMounted = true

    async function fetchMenu() {
      setLoading(true)
      setError(false)

      try {
        const { data, error: fetchError } = await getPublicMenu(businessId)

        if (!isMounted) return

        if (fetchError || !data) {
          setError(true)
        } else {
          setCategories(data.categories)
          setProducts(data.products)
        }
      } catch {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (businessId) {
      fetchMenu()
    }

    return () => {
      isMounted = false
    }
  }, [businessId])

  // 1. Loading State
  if (loading) {
    return (
      <section className="space-y-4" aria-label="Menu Loading">
        <div className="flex items-center justify-between">
          <div className="h-6 w-28 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="h-9 w-20 bg-stone-200 rounded-xl shrink-0 animate-pulse" />
          <div className="h-9 w-24 bg-stone-200 rounded-xl shrink-0 animate-pulse" />
          <div className="h-9 w-24 bg-stone-200 rounded-xl shrink-0 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex justify-between gap-3 animate-pulse"
            >
              <div className="space-y-2 flex-1">
                <div className="h-5 w-1/2 bg-stone-200 rounded" />
                <div className="h-3 w-3/4 bg-stone-200 rounded" />
                <div className="h-4 w-1/3 bg-stone-200 rounded mt-2" />
              </div>
              <div className="w-20 h-20 bg-stone-200 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <section className="space-y-3" aria-label="Daftar Menu">
        <div className="border-b border-stone-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">
            Menu
          </h2>
          <p className="text-lg font-bold text-stone-900">Daftar Menu</p>
        </div>
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/60 text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-stone-800">
            Menu belum dapat dimuat.
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Silakan coba beberapa saat lagi.
          </p>
        </div>
      </section>
    )
  }

  // Filter categories and products
  // Categories that have active products or all categories
  const categoriesWithProducts = categories.filter((cat) =>
    products.some((p) => p.category_id === cat.id)
  )

  const hasMenuContent = categoriesWithProducts.length > 0 && products.length > 0

  // 3. Empty Menu State
  if (!hasMenuContent) {
    return (
      <section className="space-y-3" aria-label="Daftar Menu">
        <div className="border-b border-stone-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">
            Menu
          </h2>
          <p className="text-lg font-bold text-stone-900">Daftar Menu</p>
        </div>
        <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/60 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-200/60 text-stone-400 flex items-center justify-center mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-stone-800">
            Menu belum tersedia.
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            Bisnis ini belum memiliki daftar menu yang ditampilkan.
          </p>
        </div>
      </section>
    )
  }

  // Determine categories to render based on selected tab
  const displayedCategories =
    selectedCategoryId === 'all'
      ? categoriesWithProducts
      : categoriesWithProducts.filter((c) => c.id === selectedCategoryId)

  return (
    <section className="space-y-4" aria-label="Daftar Menu">
      {/* Section Title */}
      <div className="border-b border-stone-100 pb-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary-700">
          Menu
        </h2>
        <p className="text-lg font-bold text-stone-900">Daftar Menu</p>
      </div>

      {/* Category Horizontal Filter Navigation (if multiple categories) */}
      {categoriesWithProducts.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-600'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
            aria-label="Tampilkan semua menu"
          >
            Semua
          </button>
          {categoriesWithProducts.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(category.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategoryId === category.id
                  ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-600'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
              aria-label={`Filter menu ${category.name}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Categories & Products List */}
      <div className="space-y-6">
        {displayedCategories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.category_id === category.id
          )

          if (categoryProducts.length === 0) return null

          return (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="pt-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Products List */}
              <div className="grid gap-3">
                {categoryProducts.map((product) => (
                  <article
                    key={product.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-start justify-center gap-3 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      <span className="text-sm font-extrabold text-primary-700 mt-2 block">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    {/* Image if available */}
                    {product.image_url && (
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                      />
                    )}
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
