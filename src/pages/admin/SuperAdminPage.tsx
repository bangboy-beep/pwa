import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../lib/supabase/client';
import { Loading } from '../../components/ui/Loading';
import { Plus, X, ExternalLink, Search, Store, CheckCircle2, ChevronRight, RefreshCw, Copy, Check, Key, KeyRound, Share2, Eye, EyeOff } from 'lucide-react';
import { createBusinessWithOwner, generateRandomPin, getBusinessPins, setBusinessPin } from '../../lib/business/service';
import { useBusiness } from '../../providers/BusinessProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
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
  const [pinsMap, setPinsMap] = useState<Record<string, string>>({});
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Edit / Set PIN state
  const [editingBiz, setEditingBiz] = useState<BusinessRow | null>(null);
  const [editPinInput, setEditPinInput] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [isResyncingAll, setIsResyncingAll] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPin, setOwnerPin] = useState(() => generateRandomPin(6));
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal hasil sukses pembuatan bisnis & akun owner
  const [createdResult, setCreatedResult] = useState<{
    businessName: string;
    slug: string;
    ownerEmail: string;
    ownerPin: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAll = async () => {
    try {
      const supabase = createClient();
      const [bizRes, pins] = await Promise.all([
        supabase.from('businesses').select('*').order('created_at', { ascending: false }),
        getBusinessPins(),
      ]);

      if (bizRes.error) throw bizRes.error;
      setBusinesses((bizRes.data as BusinessRow[]) || []);
      setPinsMap(pins || {});
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
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSlugChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(cleaned);
  };

  const handleRegeneratePin = () => {
    setOwnerPin(generateRandomPin(6));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || slug.trim();
    const finalSlug = (slug.trim() || name.trim())
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!finalName || !finalSlug) {
      setError('Mohon isi Nama Bisnis terlebih dahulu (ada di bagian atas form).');
      return;
    }

    setIsCreating(true);
    setError(null);
    const { data, error: createError } = await createBusinessWithOwner({
      name: finalName,
      slug: finalSlug,
      business_type: businessType,
      owner_email: ownerEmail.trim() || undefined,
      owner_pin: ownerPin.trim() || undefined,
    });
    setIsCreating(false);

    if (createError) {
      setError(createError.message || 'Gagal membuat bisnis');
      return;
    }
    if (data) {
      setName('');
      setSlug('');
      setOwnerEmail('');
      setOwnerPin(generateRandomPin(6));
      setShowAddSheet(false);
      setPinsMap((prev) => ({ ...prev, [data.business.id]: data.ownerPin }));
      fetchAll();

      // Tampilkan modal kredensial owner yang baru dibuat
      setCreatedResult({
        businessName: data.business.name,
        slug: data.business.slug,
        ownerEmail: data.ownerEmail,
        ownerPin: data.ownerPin,
      });
    }
  };

  const manageBusiness = (b: BusinessRow) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSelectedBusiness({ ...(b as any), role: 'owner' });
    sessionStorage.setItem('smartqr_selected_business_id', b.id);
    navigate('/admin');
  };

  const getShareText = () => {
    if (!createdResult) return '';
    const origin = window.location.origin;
    return `Halo! Akun SmartQR untuk *${createdResult.businessName}* telah siap:\n\n🔗 Link Pelanggan: ${origin}/q/${createdResult.slug}\n🔑 Link Admin: ${origin}/admin/${createdResult.slug}\n📌 PIN Admin: ${createdResult.ownerPin}\n\nCukup buka Link Admin dan masukkan PIN untuk langsung mengelola menu, WiFi, dan ulasan toko Anda!`;
  };

  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    // 1. Try modern clipboard API (works on HTTPS or localhost)
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('navigator.clipboard failed:', err);
      }
    }

    // 2. Reliable fallback for HTTP (local network IP seperti 192.168.x.x di HP)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('execCommand copy failed:', err);
      return false;
    }
  };

  const handleCopyCredentials = async () => {
    const text = getShareText();
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Pesan kredensial berhasil disalin!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Gagal menyalin. Silakan gunakan tombol WhatsApp!');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const toggleRevealPin = (bizId: string) => {
    setRevealedPins((prev) => ({ ...prev, [bizId]: !prev[bizId] }));
  };

  const handleCopyPinText = async (pinText: string, bizName: string) => {
    const success = await copyTextToClipboard(pinText);
    if (success) {
      toast.success(`PIN ${bizName} disalin!`);
    } else {
      toast.error('Gagal menyalin PIN');
    }
  };

  const openEditPinModal = (b: BusinessRow) => {
    setEditingBiz(b);
    setEditPinInput(pinsMap[b.id] || generateRandomPin(6));
  };

  const handleSaveEditPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;
    const cleanPin = editPinInput.trim();
    if (cleanPin.length < 4) {
      toast.error('PIN minimal 4 digit (rekomendasi 6 digit)');
      return;
    }

    setIsSavingPin(true);
    const res = await setBusinessPin(editingBiz.id, cleanPin);

    if (!res.success) {
      setIsSavingPin(false);
      toast.error(res.error || 'Gagal memperbarui PIN');
      return;
    }

    // Resync auth.users password agar PIN bisa digunakan login
    try {
      const supabase = createClient();
      await (supabase as any).rpc('resync_business_pin', { p_business_id: editingBiz.id });
    } catch (err) {
      console.warn('resync_business_pin warning:', err);
    }

    setIsSavingPin(false);
    setPinsMap((prev) => ({ ...prev, [editingBiz.id]: cleanPin }));
    setRevealedPins((prev) => ({ ...prev, [editingBiz.id]: true }));
    toast.success(`PIN ${editingBiz.name} berhasil diperbarui & disinkronisasi!`);
    setEditingBiz(null);
  };

  const handleResyncAll = async () => {
    setIsResyncingAll(true);
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any).rpc('resync_all_business_pins');
      if (error) throw error;
      toast.success(`${data} akun PIN berhasil disinkronisasi ke sistem login!`);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal resync PIN. Pastikan SQL migration 015 sudah dijalankan.');
    } finally {
      setIsResyncingAll(false);
    }
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

      {/* Resync PIN Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-amber-900">🔑 Sinkronisasi Akun Login</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Jika PIN cafe tidak bisa login, klik tombol ini untuk resync semua PIN ke sistem auth.</p>
        </div>
        <button
          type="button"
          onClick={handleResyncAll}
          disabled={isResyncingAll}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold active:scale-95 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResyncingAll ? 'animate-spin' : ''}`} />
          {isResyncingAll ? 'Proses...' : 'Resync PIN'}
        </button>
      </div>

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
          <ul className="grid gap-3 lg:grid-cols-2">
            {filtered.map((b) => {
              const currentPin = pinsMap[b.id];
              const isRevealed = !!revealedPins[b.id];

              return (
                <li
                  key={b.id}
                  className="bg-white rounded-3xl p-3 shadow-[0_2px_12px_rgba(23,22,31,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    {/* Clickable info to open management */}
                    <div
                      onClick={() => manageBusiness(b)}
                      className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer group"
                    >
                      <span className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <BusinessTypeIcon type={b.business_type} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink truncate group-hover:text-primary transition-colors">
                          {b.name}
                        </span>
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
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => manageBusiness(b)}
                        className="h-8 px-2.5 rounded-xl bg-primary-50 text-primary hover:bg-primary-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Buka Dashboard Admin Toko"
                      >
                        <span>Kelola</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/admin/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-primary hover:bg-surface transition-colors"
                        title={`Buka Link Admin /admin/${b.slug}`}
                        aria-label={`Buka link admin ${b.name}`}
                      >
                        <KeyRound className="w-4 h-4" />
                      </a>
                      <a
                        href={`/q/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-primary hover:bg-surface transition-colors"
                        title={`Buka Halaman Pelanggan /q/${b.slug}`}
                        aria-label={`Buka halaman pelanggan ${b.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* PIN Bar - Permanently saved in Super Admin */}
                  <div className="flex items-center justify-between pt-2 border-t border-outline/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-ink-muted flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-primary" />
                        PIN Admin:
                      </span>
                      {currentPin ? (
                        <div className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-lg border border-outline/50">
                          <span className="font-mono text-xs font-bold text-ink">
                            {isRevealed ? currentPin : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealPin(b.id)}
                            className="text-ink-muted hover:text-ink p-0.5 transition-colors"
                            title={isRevealed ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPinText(currentPin, b.name)}
                            className="text-ink-muted hover:text-primary p-0.5 transition-colors"
                            title="Salin PIN"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200/60">
                          Belum tercatat
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditPinModal(b)}
                      className="text-[11px] font-bold text-primary hover:text-primary-700 hover:underline px-1 py-0.5 transition-colors"
                    >
                      {currentPin ? 'Ganti PIN' : '+ Atur PIN'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Extended FAB */}
      <button
        onClick={() => {
          setError(null);
          setOwnerPin(generateRandomPin(6));
          setShowAddSheet(true);
        }}
        className="fixed right-4 z-30 h-14 pl-4 pr-5 rounded-2xl bg-primary-100 text-primary-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Plus className="w-5 h-5" />
        Tambah Bisnis
      </button>

      {/* Add business modal */}
      {showAddSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Tambah bisnis baru"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-xs animate-scrim"
            onClick={() => setShowAddSheet(false)}
          />

          {/* Modal Card: Full screen on mobile, centered dialog on desktop */}
          <form
            onSubmit={handleCreate}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90dvh] sm:max-w-lg bg-white sm:rounded-[28px] flex flex-col z-10 shadow-2xl animate-sheet-up overflow-hidden"
          >
            {/* 1. FIXED HEADER */}
            <header className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-outline/50 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-ink leading-tight">Tambah Bisnis Baru</h2>
                <p className="text-xs text-ink-muted">Isi nama bisnis & akun akses owner</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface active:scale-95 transition-all"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* 2. SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
              <Input
                label="Nama Bisnis *"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Mak Babe"
                autoFocus
              />
              <Input
                label="URL Slug *"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="mak-babe"
                helperText={slug ? `Link: /q/${slug}` : 'Otomatis dibuat dari nama bisnis'}
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

              {/* Owner Email & Auto-Generated PIN */}
              <div className="p-3.5 rounded-2xl bg-surface border border-outline space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-ink">Akun Akses Owner (Otomatis)</span>
                </div>
                <Input
                  label="Email Owner"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder={slug ? `${slug}@smartqr.app` : 'owner@email.com'}
                  helperText="Kosongkan untuk meng-generate otomatis dari slug"
                />
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1 ml-1">PIN / Password Login (6-digit)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ownerPin}
                      onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="flex-1 h-11 px-3 rounded-xl bg-white border border-outline text-sm font-mono font-bold tracking-widest text-ink focus:outline-none focus:border-primary text-center"
                    />
                    <button
                      type="button"
                      onClick={handleRegeneratePin}
                      className="h-11 px-3 rounded-xl bg-white border border-outline text-xs font-bold text-ink hover:bg-surface flex items-center gap-1.5 shrink-0"
                      title="Generate PIN acak baru"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Acak PIN
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 animate-pulse" role="alert">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* 3. FIXED FOOTER (ALWAYS VISIBLE AT BOTTOM) */}
            <footer
              className="shrink-0 p-4 bg-white border-t border-outline/40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <Button type="submit" size="lg" isLoading={isCreating} className="w-full text-base font-bold shadow-lg shadow-primary/25">
                Simpan & Generate Akun
              </Button>
            </footer>
          </form>
        </div>
      )}

      {/* Success Created Credential Modal */}
      {createdResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Hasil kredensial bisnis baru">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-xs animate-scrim" onClick={() => setCreatedResult(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl animate-sheet-up space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-extrabold text-ink">Bisnis & Akun Siap! 🎉</h3>
              <p className="text-xs text-ink-muted mt-1">
                Bisnis <span className="font-bold text-ink">{createdResult.businessName}</span> telah berhasil dibuat. Silakan bagikan akses ini ke Owner Toko.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline space-y-2 text-xs">
              <div
                onClick={() => {
                  const url = `${window.location.origin}/admin/${createdResult.slug}`;
                  copyTextToClipboard(url);
                  toast.success('Link Admin disalin!');
                }}
                className="flex justify-between items-center py-1.5 border-b border-outline/50 cursor-pointer active:opacity-70 select-none"
                title="Klik untuk salin Link Admin"
              >
                <span className="text-ink-muted font-medium">Link Admin:</span>
                <span className="font-bold text-primary font-mono flex items-center gap-1.5">
                  /admin/{createdResult.slug}
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </span>
              </div>
              <div
                onClick={() => {
                  copyTextToClipboard(createdResult.ownerPin);
                  toast.success('PIN admin disalin!');
                }}
                className="flex justify-between items-center py-1.5 border-b border-outline/50 cursor-pointer active:opacity-70 select-none"
                title="Klik untuk salin PIN"
              >
                <span className="text-ink-muted font-medium">PIN Admin (6 digit):</span>
                <span className="font-extrabold text-primary font-mono text-sm flex items-center gap-1.5">
                  {createdResult.ownerPin}
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </span>
              </div>
              <div
                onClick={() => {
                  const url = `${window.location.origin}/q/${createdResult.slug}`;
                  copyTextToClipboard(url);
                  toast.success('Link pelanggan disalin!');
                }}
                className="flex justify-between items-center py-1.5 border-b border-outline/50 cursor-pointer active:opacity-70 select-none"
                title="Klik untuk salin Link Pelanggan"
              >
                <span className="text-ink-muted font-medium">Link Pelanggan:</span>
                <span className="font-bold text-ink font-mono flex items-center gap-1.5">
                  /q/{createdResult.slug}
                  <Copy className="w-3.5 h-3.5 text-ink-muted" />
                </span>
              </div>
              <div className="flex justify-between py-1 text-[11px] text-ink-muted">
                <span>Email Login:</span>
                <span className="font-mono">{createdResult.ownerEmail}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button size="lg" onClick={handleCopyCredentials} className="w-full flex items-center justify-center gap-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Kredensial Tersalin!' : 'Salin Pesan Kredensial'}
              </Button>
              <button
                onClick={handleShareWhatsApp}
                className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
              >
                <Share2 className="w-4 h-4" />
                Kirim via WhatsApp
              </button>
              <button
                onClick={() => setCreatedResult(null)}
                className="w-full h-10 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit / Atur PIN Toko */}
      {editingBiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Atur PIN Toko"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-xs animate-scrim"
            onClick={() => !isSavingPin && setEditingBiz(null)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 animate-sheet-up space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink leading-tight">
                    {pinsMap[editingBiz.id] ? 'Ubah PIN Toko' : 'Atur PIN Toko'}
                  </h3>
                  <p className="text-xs text-ink-muted">{editingBiz.name} (/{editingBiz.slug})</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingPin}
                onClick={() => setEditingBiz(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1.5 ml-1">
                  PIN Baru (6 digit angka)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={editPinInput}
                    onChange={(e) => setEditPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Contoh: 123456"
                    className="flex-1 h-12 px-4 rounded-2xl bg-surface text-ink font-mono text-base font-bold tracking-wider border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setEditPinInput(generateRandomPin(6))}
                    className="h-12 px-3.5 rounded-2xl bg-surface hover:bg-primary-50 text-ink-muted hover:text-primary font-semibold text-xs flex items-center gap-1.5 border border-outline/50 transition-colors"
                    title="Buat PIN acak baru"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Acak
                  </button>
                </div>
                <p className="text-[11px] text-ink-muted mt-2 ml-1 leading-relaxed">
                  PIN ini akan disimpan permanen di Super Admin dan otomatis disinkronkan ke akun login toko ({editingBiz.slug}@smartqr.app).
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isSavingPin}
                  onClick={() => setEditingBiz(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isSavingPin}
                  disabled={editPinInput.length < 4}
                >
                  {isSavingPin ? 'Menyimpan...' : 'Simpan PIN'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
