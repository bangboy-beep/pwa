import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../lib/supabase/client';
import { Loading } from '../../components/ui/Loading';
import { Plus, X, ExternalLink, Settings2 } from 'lucide-react';
import { createBusiness } from '../../lib/business/service';
import { useBusiness } from '../../providers/BusinessProvider';
import type { BusinessType } from '../../types';

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
];

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { setSelectedBusiness } = useBusiness();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setBusinesses(data || []);
    } catch (err) {
      console.error('SuperAdmin Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) { setError('Mohon isi semua field.'); return; }

    const urlSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    setIsCreating(true);
    setError(null);

    const { data, error: createError } = await createBusiness({
      name: name.trim(),
      slug: urlSlug,
      business_type: businessType
    });

    setIsCreating(false);

    if (createError) {
      setError(createError.message || 'Gagal membuat bisnis');
      return;
    }

    if (data) {
      setName('');
      setSlug('');
      setShowAddModal(false);
      fetchAll();
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Panel Super Admin</h1>
          <p className="text-sm text-stone-500 mt-1">Kelola seluruh ekosistem platform SmartQR</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Bisnis
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="p-5 font-bold text-stone-700">Bisnis</th>
              <th className="p-5 font-bold text-stone-700">Tipe</th>
              <th className="p-5 font-bold text-stone-700">URL / Slug</th>
              <th className="p-5 font-bold text-stone-700">Status</th>
              <th className="p-5 font-bold text-stone-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {businesses.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-stone-400">Belum ada bisnis terdaftar.</td>
              </tr>
            ) : (
              businesses.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                      {BUSINESS_TYPES.find(t => t.value === b.business_type)?.icon || '📋'}
                    </div>
                    <span className="font-bold text-stone-900">{b.name}</span>
                  </td>
                  <td className="p-5 text-stone-500 capitalize">{b.business_type}</td>
                  <td className="p-5">
                    <a
                      href={`/q/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-600 hover:underline font-medium"
                    >
                      {b.slug}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={`/q/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        title="Lihat Publik"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          const biz = businesses.find((b2: any) => b2.id === b.id);
                          if (biz) setSelectedBusiness({ ...biz, role: 'owner' as any });
                          sessionStorage.setItem('smartqr_selected_business_id', b.id);
                          navigate('/admin');
                        }}
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        title="Masuk Admin"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-stone-900">Tambah Bisnis Baru</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">Nama Bisnis *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cafe Kopi Senja"
                  className="w-full h-11 px-4 rounded-xl border-2 border-stone-100 text-sm focus:outline-none focus:border-amber-500 bg-stone-50 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">URL Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="contoh-kopi-senja"
                  className="w-full h-11 px-4 rounded-xl border-2 border-stone-100 text-sm focus:outline-none focus:border-amber-500 bg-stone-50 focus:bg-white transition-colors"
                />
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
                          : 'border-stone-100 hover:border-stone-200 bg-white'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-[11px] font-bold text-stone-700">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={isCreating || !name.trim() || !slug.trim()}
                className="w-full h-12 mt-2 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 text-white font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isCreating ? <Loading /> : 'Simpan Bisnis Baru'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
