// SmartQR Admin Dashboard — Material Design 3 (Production Version)
// Route: /admin
// Connected to Supabase backend via useBusiness() and uploadBusinessImage()

import React, { useRef, useState } from 'react';
import {
  Plus,
  ChevronRight,
  UtensilsCrossed,
  Wifi,
  Star,
  Pencil,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../providers/BusinessProvider';
import { uploadBusinessImage } from '../../lib/business/imageService';
import { useToast } from '../../hooks/useToast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Aktif', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  inactive: { label: 'Nonaktif', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200' },
  suspended: { label: 'Ditangguhkan', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

export default function AdminDashboardPage() {
  const { selectedBusiness, loading, refetch } = useBusiness();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<'cover' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Local floating toast for immediate feedback (non-blocking)
  const showFloatingToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBusiness || !editTarget) return;

    setUploading(true);
    const { error } = await uploadBusinessImage(selectedBusiness.id, file, 'cover');
    setUploading(false);

    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', 'Banner berhasil diperbarui');
      showFloatingToast('Banner berhasil diperbarui!');
      setEditModalOpen(false);
      await refetch();
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi 👋';
    if (hour < 15) return 'Selamat siang 👋';
    if (hour < 18) return 'Selamat sore 👋';
    return 'Selamat malam 🌙';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#f0883a]" />
        <p className="text-gray-500 font-medium text-sm">Menyiapkan dashboard...</p>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] p-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#fff4ed] mb-6">
            <Plus className="h-10 w-10 text-[#f0883a]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Belum ada bisnis</h1>
          <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">
            Buat profil bisnis Anda sekarang untuk mulai menggunakan ekosistem SmartQR.
          </p>
          <a
            href="/onboarding"
            className="mt-8 flex h-14 w-full items-center justify-center rounded-full px-8 text-base font-semibold text-white bg-[#f0883a] shadow-md shadow-orange-200 hover:bg-[#e0792d] hover:shadow-lg active:scale-[0.98] transition-all"
          >
            Buat Bisnis Baru
          </a>
        </div>
      </main>
    );
  }

  const statusConfig = STATUS_CONFIG[selectedBusiness.status] ?? STATUS_CONFIG['active'];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-10 pt-4 px-4 sm:max-w-lg sm:mx-auto space-y-6 relative font-sans">

      {/* ── FLOATING TOAST (non-blocking, appears at top) ── */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* ── HERO PROFILE (flat, no card container — merges with page bg) ── */}
      <div>
        {/* Cover Image Area */}
        <div className="relative h-48 bg-gray-100">
          {selectedBusiness.cover_url ? (
            <img
              src={selectedBusiness.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400 opacity-50" />
            </div>
          )}

          {/* Gradient overlay for better badge readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Floating Action Button (FAB) - Cover Edit */}
          <button
            onClick={() => {
              setEditTarget('cover');
              setEditModalOpen(true);
            }}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md text-gray-800 shadow-sm flex items-center justify-center hover:bg-white active:scale-95 transition-all z-10"
            title="Ganti Banner"
          >
            <Pencil className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Content Area — overlaps cover slightly, no card border */}
        <div className="px-6 pb-5 -mt-5 relative z-10">
          <div className="pt-4">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-widest">{greeting()}</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1 tracking-tight">
              {selectedBusiness.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                · {selectedBusiness.business_type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SETTINGS MENU GROUP — more breathing room ── */}
      <div className="pt-4">
        <h2 className="px-5 text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          Pengaturan Bisnis
        </h2>

        {/* Settings Group Card — squared corners */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Menu Item 1: Kelola Menu */}
          <a
            href="/admin/menu"
            className="w-full text-left group flex items-center gap-5 px-6 py-5 active:bg-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer block"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#fff4ed] text-[#f0883a]">
              <UtensilsCrossed className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-gray-900">
                Kelola Menu
              </p>
              <p className="text-[14px] text-gray-500 mt-0.5 truncate">
                Atur daftar makanan & minuman
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </a>

          {/* Divider */}
          <div className="h-px bg-gray-100 ml-[88px]" />

          {/* Menu Item 2: Kelola WiFi */}
          <a
            href="/admin/wifi"
            className="w-full text-left group flex items-center gap-5 px-6 py-5 active:bg-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer block"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <Wifi className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-gray-900">
                Akses WiFi
              </p>
              <p className="text-[14px] text-gray-500 mt-0.5 truncate">
                Atur password WiFi pelanggan
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </a>

          {/* Divider */}
          <div className="h-px bg-gray-100 ml-[88px]" />

          {/* Menu Item 3: Google Review */}
          <a
            href="/admin/review"
            className="w-full text-left group flex items-center gap-5 px-6 py-5 active:bg-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer block"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
              <Star className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-gray-900">
                Google Review
              </p>
              <p className="text-[14px] text-gray-500 mt-0.5 truncate">
                Tautkan profil ulasan bisnis
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </a>

        </div>
      </div>

      {/* ── FOOTER LOGO ── */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[12px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="h-5 w-5 rounded-md flex items-center justify-center text-white font-black bg-[#f0883a]">
            <span className="text-[9px]">QR</span>
          </div>
          <span>SmartQR Admin</span>
        </div>
      </div>

      {/* ── EDIT PHOTO BOTTOM SHEET MODAL (Android Style) ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:p-4">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setEditModalOpen(false)}
          />

          {/* Bottom Sheet Container */}
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 pb-10 shadow-2xl z-10 animate-slide-up">
            {/* Drag Handle (Android style) */}
            <div className="w-12 h-[5px] bg-gray-200 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-2xl tracking-tight">Edit Foto</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2.5 rounded-full text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Banner */}
              <button
                onClick={() => {
                  setEditTarget('cover');
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="w-full flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-700">
                  <ImageIcon className="w-6 h-6 text-[#f0883a]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[17px] font-bold text-gray-900">
                    {uploading && editTarget === 'cover' ? 'Mengunggah Banner...' : 'Ganti Banner'}
                  </p>
                  <p className="text-[14px] text-gray-500 mt-0.5 font-medium">Format JPG/PNG, maks 5MB</p>
                </div>
                {uploading && editTarget === 'cover' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#f0883a]" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {/* ── INLINE ANIMATIONS (bottom sheet slide up) ── */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); }
          to { transform: translate(-50%, 0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}</style>
    </div>
  );
}
