// SmartQR Menu Management — Storyboard Screens 3 & 4
// Route: /admin/menu

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Plus, Edit2, Trash2, AlertCircle, X, Search,
  UtensilsCrossed, ShoppingBag, ImagePlus,
} from 'lucide-react'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useBusiness } from '../providers/BusinessProvider'
import { Loading } from '../components/ui/Loading'
import { cn } from '../components/ui/utils'
import {
  getCategories, getProducts, createCategory, updateCategory,
  deleteCategory, createProduct, updateProduct, deleteProduct,
  uploadProductImage,
} from '../lib/menu/service'
import type { MenuCategory, MenuProduct } from '../types'

function formatRupiah(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
}

export default function MenuPage() {
  const { businessId: routeBusinessId } = useParams<{ businessId?: string }>()
  const { businesses, selectedBusiness, setSelectedBusiness, loading: businessLoading } = useBusiness()
  useAuthGuard()

  const currentBusiness = routeBusinessId
    ? businesses.find((b) => b.id === routeBusinessId) || selectedBusiness
    : selectedBusiness || businesses[0] || null
  const isStaff = currentBusiness?.role === 'staff'

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDesc, setCategoryDesc] = useState('')
  const [categorySort, setCategorySort] = useState('0')
  const [categoryActive, setCategoryActive] = useState(true)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null)

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null)
  const [productCategoryId, setProductCategoryId] = useState('')
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productSort, setProductSort] = useState('0')
  const [productActive, setProductActive] = useState(true)
  const [productSubmitting, setProductSubmitting] = useState(false)
  const [productFormError, setProductFormError] = useState<string | null>(null)
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'product'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (routeBusinessId && businesses.length > 0) {
      const match = businesses.find((b) => b.id === routeBusinessId)
      if (match && match.id !== selectedBusiness?.id) setSelectedBusiness(match)
    }
  }, [routeBusinessId, businesses])

  useEffect(() => {
    if (!currentBusiness) { setLoadingMenu(false); return }
    async function load() {
      setLoadingMenu(true)
      try {
        const [catRes, prodRes] = await Promise.all([getCategories(currentBusiness!.id), getProducts(currentBusiness!.id)])
        if (!catRes.error && !prodRes.error) {
          setCategories(catRes.data)
          setProducts(prodRes.data)
        }
      } finally { setLoadingMenu(false) }
    }
    load()
  }, [currentBusiness?.id])

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500) }

  const handleOpenAddCategory = () => { if (isStaff) return; setEditingCategory(null); setCategoryName(''); setCategoryDesc(''); setCategorySort('0'); setCategoryActive(true); setCategoryFormError(null); setIsCategoryModalOpen(true) }
  const handleOpenEditCategory = (cat: MenuCategory) => { if (isStaff) return; setEditingCategory(cat); setCategoryName(cat.name); setCategoryDesc(cat.description || ''); setCategorySort(String(cat.sort_order)); setCategoryActive(cat.is_active); setCategoryFormError(null); setIsCategoryModalOpen(true) }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBusiness || isStaff) return
    if (!categoryName.trim()) { setCategoryFormError('Nama kategori wajib diisi.'); return }
    setCategorySubmitting(true); setCategoryFormError(null)
    try {
      if (editingCategory) {
        const { data, error } = await updateCategory(editingCategory.id, currentBusiness.id, { name: categoryName, description: categoryDesc, sort_order: parseInt(categorySort) || 0, is_active: categoryActive })
        if (!error && data) { setCategories(p => p.map(c => c.id === data.id ? data : c).sort((a, b) => a.sort_order - b.sort_order)); setIsCategoryModalOpen(false); showToast('Kategori berhasil diperbarui.') }
        else setCategoryFormError(error?.message || 'Gagal memperbarui.')
      } else {
        const { data, error } = await createCategory({ business_id: currentBusiness.id, name: categoryName, description: categoryDesc, sort_order: parseInt(categorySort) || 0, is_active: categoryActive })
        if (!error && data) { setCategories(p => [...p, data].sort((a, b) => a.sort_order - b.sort_order)); setIsCategoryModalOpen(false); showToast('Kategori berhasil dibuat.') }
        else setCategoryFormError(error?.message || 'Gagal membuat kategori.')
      }
    } catch { setCategoryFormError('Terjadi kesalahan sistem.') }
    finally { setCategorySubmitting(false) }
  }

  const handleOpenAddProduct = (defaultCatId?: string) => {
    if (isStaff) return
    if (categories.length === 0) { showToast('Buat kategori terlebih dahulu.'); return }
    setEditingProduct(null); setProductCategoryId(defaultCatId || categories[0]?.id || ''); setProductName(''); setProductDesc(''); setProductPrice(''); setProductSort('0'); setProductActive(true); setProductFormError(null); setProductImageFile(null); setProductImagePreview(null); setIsProductModalOpen(true)
  }
  const handleOpenEditProduct = (prod: MenuProduct) => { if (isStaff) return; setEditingProduct(prod); setProductCategoryId(prod.category_id); setProductName(prod.name); setProductDesc(prod.description || ''); setProductPrice(String(prod.price)); setProductSort(String(prod.sort_order)); setProductActive(prod.is_active); setProductFormError(null); setProductImageFile(null); setProductImagePreview(prod.image_url || null); setIsProductModalOpen(true) }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBusiness || isStaff) return
    if (!productName.trim()) { setProductFormError('Nama produk wajib diisi.'); return }
    if (!productCategoryId) { setProductFormError('Kategori wajib dipilih.'); return }
    const parsedPrice = parseFloat(productPrice); if (isNaN(parsedPrice) || parsedPrice < 0) { setProductFormError('Harga harus angka valid.'); return }
    setProductSubmitting(true); setProductFormError(null)
    try {
      let imageUrl: string | undefined = editingProduct?.image_url ?? undefined
      if (productImageFile) {
        const { url, error: uploadError } = await uploadProductImage(currentBusiness.id, editingProduct?.id || crypto.randomUUID(), productImageFile)
        if (uploadError) { setProductFormError(uploadError.message || 'Gagal mengunggah gambar.'); return }
        imageUrl = url
      }
      if (editingProduct) {
        const { data, error } = await updateProduct(editingProduct.id, currentBusiness.id, { category_id: productCategoryId, name: productName, description: productDesc, price: parsedPrice, sort_order: parseInt(productSort) || 0, is_active: productActive, image_url: imageUrl })
        if (!error && data) { setProducts(p => p.map(pr => pr.id === data.id ? data : pr).sort((a, b) => a.sort_order - b.sort_order)); setIsProductModalOpen(false); showToast('Produk berhasil diperbarui.') }
        else setProductFormError(error?.message || 'Gagal memperbarui.')
      } else {
        const { data, error } = await createProduct({ business_id: currentBusiness.id, category_id: productCategoryId, name: productName, description: productDesc, price: parsedPrice, sort_order: parseInt(productSort) || 0, is_active: productActive, image_url: imageUrl })
        if (!error && data) { setProducts(p => [...p, data].sort((a, b) => a.sort_order - b.sort_order)); setIsProductModalOpen(false); showToast('Produk berhasil dibuat.') }
        else setProductFormError(error?.message || 'Gagal membuat produk.')
      }
    } catch { setProductFormError('Terjadi kesalahan sistem.') }
    finally { setProductSubmitting(false) }
  }

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/') || !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) { setProductFormError('Format gambar harus PNG atau JPEG.'); return }
    if (file.size > 5 * 1024 * 1024) { setProductFormError('Ukuran gambar maksimal 5 MB.'); return }
    setProductFormError(null); setProductImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setProductImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDeleteConfirm = async () => {
    if (!currentBusiness || !deleteConfirm || isStaff) return
    setDeleting(true)
    try {
      if (deleteConfirm.type === 'category') {
        const { error } = await deleteCategory(deleteConfirm.id, currentBusiness.id)
        if (!error) { setCategories(p => p.filter(c => c.id !== deleteConfirm.id)); setProducts(p => p.filter(p => p.category_id !== deleteConfirm.id)); showToast('Kategori berhasil dihapus.') }
      } else {
        const { error } = await deleteProduct(deleteConfirm.id, currentBusiness.id)
        if (!error) { setProducts(p => p.filter(p => p.id !== deleteConfirm.id)); showToast('Produk berhasil dihapus.') }
      }
    } catch {}
    finally { setDeleting(false); setDeleteConfirm(null) }
  }

  if (businessLoading || loadingMenu) return <Loading />
  if (!currentBusiness) return <div className="p-12 text-center text-stone-500">Bisnis tidak ditemukan</div>

  const searchedProducts = products.filter(p => searchQuery.trim() === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description?.toLowerCase().includes(searchQuery.toLowerCase())))
  const filteredCats = selectedCategoryId === 'all' ? categories : categories.filter(c => c.id === selectedCategoryId)

  return (
    <div className="w-full space-y-5 pb-4">
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm max-w-[calc(100%-40px)] w-max text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}

      {/* Category filter tabs — MD3 Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
        <button onClick={() => setSelectedCategoryId('all')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
            selectedCategoryId === 'all'
              ? 'bg-orange-100 border-orange-200 text-[#f0883a]'
              : 'bg-white border-stone-200 text-stone-600 active:bg-stone-50'
          )}>
          Semua ({products.length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.category_id === cat.id).length
          return (
            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
                selectedCategoryId === cat.id
                  ? 'bg-orange-100 border-orange-200 text-[#f0883a]'
                  : 'bg-white border-stone-200 text-stone-600 active:bg-stone-50'
              )}>
              {cat.name} <span className={cn(
                'ml-1 px-1.5 py-0.5 rounded-md text-[10px]',
                selectedCategoryId === cat.id ? 'bg-white/50' : 'bg-stone-100'
              )}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search bar — MD3 Outlined Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari menu..."
          className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all placeholder:text-stone-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-stone-400 hover:text-stone-600 active:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product list */}
      {categories.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 p-8 text-center bg-white shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-[#f0883a]" />
          </div>
          <h3 className="text-[15px] font-bold text-stone-900">Belum ada kategori</h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed px-4">Buat kategori untuk mulai menambahkan produk ke menu Anda.</p>
          {!isStaff && <button onClick={handleOpenAddCategory} className="mt-6 w-full h-11 rounded-xl bg-[#f0883a] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
            <Plus className="w-5 h-5" /> Tambah Kategori
          </button>}
        </div>
      ) : filteredCats.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-sm bg-white shadow-sm font-medium">Kategori tidak ditemukan.</div>
      ) : (
        <div className="space-y-6">
          {filteredCats.map(category => {
            const catProducts = searchedProducts.filter(p => p.category_id === category.id)
            return (
              <div key={category.id} className="space-y-3">
                {/* Category header — Solid MD3 style */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h2 className="font-bold text-stone-900 text-[16px]">{category.name}</h2>
                    {!category.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-bold uppercase tracking-wider">Nonaktif</span>}
                    <span className="text-[11px] text-stone-400 font-bold">{catProducts.length}</span>
                  </div>
                  {!isStaff && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleOpenEditCategory(category)} className="p-2 rounded-full text-stone-400 active:bg-stone-100 transition-colors" title="Edit kategori">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })} className="p-2 rounded-full text-stone-400 active:bg-red-50 active:text-red-500 transition-colors" title="Hapus kategori">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {catProducts.length === 0 ? (
                    <div className="py-8 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      {searchQuery ? 'Tidak ada produk yang cocok.' : 'Belum ada produk di kategori ini.'}
                      {!isStaff && !searchQuery && (
                        <button onClick={() => handleOpenAddProduct(category.id)} className="block mx-auto mt-2 font-bold text-[#f0883a] hover:underline">
                          Tambah produk
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {catProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center gap-3 active:bg-stone-50 transition-colors group">
                          {/* Product image thumbnail */}
                          <div className="w-16 h-16 rounded-xl border border-stone-100 flex items-center justify-center bg-stone-50 shrink-0 overflow-hidden">
                            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-7 h-7 text-stone-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-stone-900 text-sm truncate">{product.name}</h3>
                              {!product.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 font-bold uppercase shrink-0">Off</span>}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-medium">{product.description || 'Tidak ada deskripsi'}</p>
                            <p className="text-[13px] font-bold text-[#f0883a] mt-1">{formatRupiah(product.price)}</p>
                          </div>
                          {!isStaff && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => handleOpenEditProduct(product)} className="p-2 rounded-full text-stone-400 active:bg-orange-50 active:text-[#f0883a] transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm({ type: 'product', id: product.id, name: product.name })} className="p-2 rounded-full text-stone-400 active:bg-red-50 active:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Menu FAB — Proper Material FAB style */}
      {!isStaff && (
        <button
          onClick={() => handleOpenAddProduct()}
          className="fixed z-40 h-14 w-14 rounded-full text-white shadow-lg active:scale-90 transition-all flex items-center justify-center bg-[#f0883a]"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 16px))',
            right: '16px'
          }}
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Category Modal — MD3 Centered Dialog */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100">
            <div className="px-6 pt-6 pb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-stone-900">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Kelola kelompok menu Anda.</p>
                </div>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 -mr-2 rounded-full active:bg-stone-100 text-stone-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {categoryFormError && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0" /><span>{categoryFormError}</span></div>}

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Nama Kategori *</label>
                  <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Makanan, Minuman, dll" className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Deskripsi (Opsional)</label>
                  <textarea value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} rows={2} placeholder="Keterangan singkat..." className="w-full px-4 py-3 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Urutan</label>
                    <input type="number" value={categorySort} onChange={(e) => setCategorySort(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all" />
                  </div>
                  <div className="flex items-center pt-7">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={categoryActive} onChange={(e) => setCategoryActive(e.target.checked)} className="w-5 h-5 accent-[#f0883a] rounded-lg border-2 border-stone-300 transition-all" />
                      <span className="text-sm font-bold text-stone-800">Aktif</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 h-12 rounded-xl border border-stone-300 text-stone-600 font-bold text-[15px] active:bg-stone-50 transition-colors">Batal</button>
                  <button type="submit" disabled={categorySubmitting} className="flex-1 h-12 rounded-xl bg-[#f0883a] text-white font-bold text-[15px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {categorySubmitting && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal — MD3 Centered Dialog */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100">
            {/* Image upload area */}
            <div className="relative h-48 bg-stone-100 overflow-hidden">
              {productImagePreview || editingProduct?.image_url ? (
                <img src={productImagePreview || editingProduct?.image_url || ''} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 px-8 text-center">
                  <ImagePlus className="w-10 h-10 mb-2 opacity-30" />
                  <span className="text-xs font-bold uppercase tracking-wider">Upload Foto Menu</span>
                </div>
              )}
              <button onClick={() => setIsProductModalOpen(false)} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white active:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <label className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg cursor-pointer text-xs font-bold text-stone-900 active:bg-stone-50 transition-all border border-stone-100">
                <ImagePlus className="w-4 h-4 text-[#f0883a]" />
                <span>{productImagePreview || editingProduct?.image_url ? 'Ganti' : 'Upload'}</span>
                <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleProductImageChange} />
              </label>
            </div>

            <div className="px-6 pt-5 pb-6">
              <div className="mb-6">
                <h3 className="text-[18px] font-bold text-stone-900">{editingProduct ? 'Edit Menu' : 'Tambah Menu'}</h3>
                <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">Atur detail menu, harga, dan ketersediaan untuk pelanggan.</p>
              </div>

              {productFormError && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 shrink-0" /><span>{productFormError}</span></div>}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Kategori *</label>
                  <div className="relative">
                    <select value={productCategoryId} onChange={(e) => setProductCategoryId(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] appearance-none" required>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <Search className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Nama Produk *</label>
                  <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Nasi Goreng Spesial" className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Deskripsi (Opsional)</label>
                  <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all resize-none" placeholder="Deskripsi singkat menu..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Harga (Rp) *</label>
                    <input type="number" min="0" step="any" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="25000" className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Urutan</label>
                    <input type="number" value={productSort} onChange={(e) => setProductSort(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] bg-transparent transition-all" />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => setProductActive(!productActive)}>
                  <input type="checkbox" checked={productActive} onChange={() => setProductActive(!productActive)} className="w-5 h-5 accent-[#f0883a] rounded-lg border-2 border-stone-300 transition-all" />
                  <span className="text-sm font-bold text-stone-800">Menu Tersedia</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 h-12 rounded-xl border border-stone-300 text-stone-600 font-bold text-[15px] active:bg-stone-50 transition-colors">Batal</button>
                  <button type="submit" disabled={productSubmitting} className="flex-1 h-12 rounded-xl bg-[#f0883a] text-white font-bold text-[15px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {productSubmitting && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal — MD3 Dialog style */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl max-w-xs w-full p-6 shadow-2xl text-center border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-[17px] font-bold text-stone-900 mb-2">Hapus {deleteConfirm.type === 'category' ? 'Kategori' : 'Produk'}?</h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed font-medium">
              {deleteConfirm.type === 'category' ? `Menghapus "${deleteConfirm.name}" juga akan menghapus semua produk di dalamnya.` : `Anda akan menghapus "${deleteConfirm.name}" dari menu.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-12 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm active:bg-stone-50 transition-colors">Batal</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
