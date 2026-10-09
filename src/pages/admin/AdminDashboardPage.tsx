// SmartQR Admin Dashboard — Android Material You style
// Route: /admin

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ChevronRight,
  UtensilsCrossed,
  Wifi,
  Star,
  QrCode,
  Printer,
  Camera,
  X,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { useBusiness } from '../../providers/BusinessProvider';
import { uploadBusinessImage } from '../../lib/business/imageService';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../../components/ui/Loading';
import { getBusinessTypeMeta } from '../../components/ui/BusinessTypeIcon';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Aktif', className: 'bg-emerald-100 text-emerald-800' },
  inactive: { label: 'Nonaktif', className: 'bg-stone-200 text-stone-700' },
  suspended: { label: 'Ditangguhkan', className: 'bg-red-100 text-red-700' },
};

const QUICK_ACTIONS = [
  { name: 'Menu', desc: 'Makanan & minuman', path: '/admin/menu', icon: UtensilsCrossed, tone: 'bg-primary-100 text-primary-800' },
  { name: 'WiFi', desc: 'Password pelanggan', path: '/admin/wifi', icon: Wifi, tone: 'bg-sky-100 text-sky-800' },
  { name: 'Review', desc: 'Ulasan Google', path: '/admin/review', icon: Star, tone: 'bg-amber-100 text-amber-800' },
  { name: 'QR Code', desc: 'Bagikan ke pelanggan', path: '/admin/qr', icon: QrCode, tone: 'bg-emerald-100 text-emerald-800' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function AdminDashboardPage() {
  const { selectedBusiness, loading, refetch } = useBusiness();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<'logo' | 'cover' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const pickFile = (target: 'logo' | 'cover') => {
    setEditTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedBusiness || !editTarget) return;

    setUploading(true);
    const { error } = await uploadBusinessImage(selectedBusiness.id, file, editTarget);
    setUploading(false);

    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', editTarget === 'logo' ? 'Logo berhasil diperbarui' : 'Banner berhasil diperbarui');
      setSheetOpen(false);
      await refetch();
    }
  };

  if (loading) return <Loading label="Menyiapkan dashboard..." />;

  if (!selectedBusiness) {
    return (
      <div className="pt-10 flex flex-col items-center text-center px-2">
        <div className="w-20 h-20 rounded-[28px] bg-primary-100 flex items-center justify-center">
          <Plus className="h-10 w-10 text-primary" strokeWidth={2.5} />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-ink tracking-tight">Belum ada bisnis</h2>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed text-balance">
          Buat profil bisnis Anda untuk mulai menggunakan SmartQR.
        </p>
        <Link
          to="/onboarding"
          className="mt-8 h-14 w-full rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Buat Bisnis Baru
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[selectedBusiness.status] ?? STATUS_CONFIG.active;

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-ink-muted px-1">{greeting()}, siap melayani pelanggan hari ini?</p>

      {/* Profile card */}
      <section className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(23,22,31,0.06)]">
        <div className="relative h-32 bg-primary-100">
          {selectedBusiness.cover_url ? (
            <img src={selectedBusiness.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700" />
          )}
          <button
            onClick={() => setSheetOpen(true)}
            className="absolute top-3 right-3 h-9 px-3 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Camera className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end gap-3 -mt-9">
            <button
              onClick={() => setSheetOpen(true)}
              className="relative w-[72px] h-[72px] rounded-[22px] bg-ink text-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0"
              aria-label="Ganti logo"
            >
              {selectedBusiness.logo_url ? (
                <img src={selectedBusiness.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold">{selectedBusiness.name.charAt(0).toUpperCase()}</span>
              )}
            </button>
            <div className="flex gap-1.5 pb-1 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface text-ink-muted">
                {getBusinessTypeMeta(selectedBusiness.business_type).label}
              </span>
            </div>
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-ink tracking-tight text-balance">{selectedBusiness.name}</h2>
          <a
            href={`/q/${selectedBusiness.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            /q/{selectedBusiness.slug}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="px-1 mb-3 text-sm font-bold text-ink">Kelola Bisnis</h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.path}
              to={a.path}
              className="bg-white rounded-3xl p-4 flex flex-col gap-3 shadow-[0_2px_12px_rgba(23,22,31,0.04)] active:scale-[0.97] transition-transform"
            >
              <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${a.tone}`}>
                <a.icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">{a.name}</span>
                <span className="block text-xs text-ink-muted truncate">{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Print banner */}
      <Link
        to="/admin/qr/print"
        className="flex items-center gap-4 p-4 rounded-3xl bg-ink text-white active:scale-[0.98] transition-transform"
      >
        <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Printer className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold">Cetak QR untuk meja</span>
          <span className="block text-xs text-white/70">Siap tempel dalam ukuran A4</span>
        </span>
        <ChevronRight className="w-5 h-5 text-white/60 shrink-0" />
      </Link>

      {/* Edit photo bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Edit foto">
          <div className="absolute inset-0 bg-ink/40 animate-scrim" onClick={() => !uploading && setSheetOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[28px] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-sheet-up">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4" aria-hidden="true" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink text-lg">Edit Foto</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {(['cover', 'logo'] as const).map((target) => (
                <button
                  key={target}
                  onClick={() => pickFile(target)}
                  disabled={uploading}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-surface active:bg-primary-50 transition-colors disabled:opacity-60"
                >
                  <span className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-left min-w-0">
                    <span className="block text-sm font-bold text-ink">
                      {uploading && editTarget === target
                        ? 'Mengunggah...'
                        : target === 'cover'
                          ? 'Ganti Banner'
                          : 'Ganti Logo'}
                    </span>
                    <span className="block text-xs text-ink-muted">JPG, PNG, atau WEBP, maks 5MB</span>
                  </span>
                  {uploading && editTarget === target ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-ink-muted" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
