import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../lib/supabase/client';
import { Loading } from '../../components/ui/Loading';
import { Plus, X, ExternalLink, Search, Store, CheckCircle2, ChevronRight } from 'lucide-react';
import { createBusiness } from '../../lib/business/service';
import { useBusiness } from '../../providers/BusinessProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BUSINESS_TYPE_META, BusinessTypeIcon, getBusinessTypeMeta } from '../../components/ui/BusinessTypeIcon';
import type { BusinessType } from '../../types';

interface BusinessRow {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  status: string;
  logo_url?: string | null;
}

const BUSINESS_TYPES = Object.entries(BUSINESS_TYPE_META).map(([value, meta]) => ({
  value: value as BusinessType,
  label: meta.label,
}));

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const { setSelectedBusiness } = useBusiness();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);

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
      setBusinesses((data as BusinessRow[]) || []);
    } catch (err) {
      console.error('SuperAdmin Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
  }, [businesses, query]);

  const activeCount = businesses.filter((b) => b.status === 'active').length;

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Mohon isi semua field.');
      return;
    }
    const urlSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    setIsCreating(true);
    setError(null);
    const { data, error: createError } = await createBusiness({
      name: name.trim(),
      slug: urlSlug,
      business_type: businessType,
    });
    setIsCreating(false);

    if (createError) {
      setError(createError.message || 'Gagal membuat bisnis');
      return;
    }
    if (data) {
      setName('');
      setSlug('');
      setShowAddSheet(false);
      fetchAll();
    }
  };

  const manageBusiness = (b: BusinessRow) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSelectedBusiness({ ...(b as any), role: 'owner' });
    sessionStorage.setItem('smartqr_selected_business_id', b.id);
    navigate('/admin');
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-2 pb-28 space-y-5">
      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-primary text-white p-4">
          <Store className="w-5 h-5 text-white/80" />
          <p className="mt-3 text-3xl font-extrabold leading-none">{businesses.length}</p>
          <p className="mt-1 text-xs font-medium text-white/80">Total bisnis</p>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-[0_2px_12px_rgba(23,22,31,0.04)]">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="mt-3 text-3xl font-extrabold leading-none text-ink">{activeCount}</p>
          <p className="mt-1 text-xs font-medium text-ink-muted">Bisnis aktif</p>
        </div>
      </section>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted pointer-events-none" aria-hidden="true" />
        <label htmlFor="biz-search" className="sr-only">Cari bisnis</label>
        <input
          id="biz-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau slug bisnis"
          className="w-full h-12 pl-12 pr-4 rounded-full bg-white text-sm text-ink placeholder:text-ink-muted/70 shadow-[0_2px_12px_rgba(23,22,31,0.04)] border-2 border-transparent focus:outline-none focus:border-primary"
        />
      </div>

      {/* List */}
      <section>
        <h2 className="px-1 mb-3 text-sm font-bold text-ink">Semua Bisnis</h2>
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary mx-auto flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-ink">
              {query ? 'Tidak ada hasil' : 'Belum ada bisnis terdaftar'}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {query ? 'Coba kata kunci lain.' : 'Tambahkan bisnis pertama dengan tombol di bawah.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {filtered.map((b) => (
              <li key={b.id} className="bg-white rounded-3xl p-2 pr-2 flex items-center gap-1 shadow-[0_2px_12px_rgba(23,22,31,0.04)]">
                <button
                  onClick={() => manageBusiness(b)}
                  className="flex-1 min-w-0 flex items-center gap-3 p-1.5 rounded-2xl text-left active:bg-surface transition-colors"
                >
                  <span className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {b.logo_url ? (
                      <img src={b.logo_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <BusinessTypeIcon type={b.business_type} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink truncate">{b.name}</span>
                    <span className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.status === 'active' ? 'bg-emerald-500' : 'bg-stone-400'}`}
                        aria-hidden="true"
                      />
                      <span className="text-xs text-ink-muted truncate">
                        {getBusinessTypeMeta(b.business_type).label} · /{b.slug}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-ink-muted shrink-0" />
                </button>
                <a
                  href={`/q/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:text-primary hover:bg-primary-50 shrink-0"
                  aria-label={`Buka halaman publik ${b.name}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Extended FAB */}
      <button
        onClick={() => {
          setError(null);
          setShowAddSheet(true);
        }}
        className="fixed right-4 z-30 h-14 pl-4 pr-5 rounded-2xl bg-primary-100 text-primary-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-5 h-5" />
        Tambah Bisnis
      </button>

      {/* Add business bottom sheet */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Tambah bisnis baru">
          <div className="absolute inset-0 bg-ink/40 animate-scrim" onClick={() => setShowAddSheet(false)} />
          <form
            onSubmit={handleCreate}
            className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-[28px] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-sheet-up"
          >
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-ink">Tambah Bisnis Baru</h2>
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input label="Nama Bisnis" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Contoh: Kopi Senja" />
              <Input
                label="URL Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kopi-senja"
                helperText={slug ? `Link: /q/${slug}` : 'Otomatis dari nama bisnis'}
              />

              <fieldset>
                <legend className="block text-xs font-semibold text-ink-muted mb-2 ml-1">Tipe Bisnis</legend>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map((type) => {
                    const selected = businessType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setBusinessType(type.value)}
                        aria-pressed={selected}
                        className={`h-9 pl-2.5 pr-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          selected
                            ? 'bg-primary-100 border-primary-100 text-primary-900'
                            : 'bg-white border-outline text-ink-muted'
                        }`}
                      >
                        <BusinessTypeIcon type={type.value} className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {error && <p className="text-sm text-red-600 font-medium" role="alert">{error}</p>}

              <Button type="submit" size="lg" isLoading={isCreating} disabled={!name.trim() || !slug.trim()} className="w-full">
                Simpan Bisnis
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
