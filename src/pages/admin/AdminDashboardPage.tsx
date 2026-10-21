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
import { useLanguage } from '../../i18n/LanguageContext';

export default function AdminDashboardPage() {
  const { selectedBusiness, loading, refetch } = useBusiness();
  const { t, language } = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<'logo' | 'cover' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('adminDashboard', 'greetingMorning');
    if (hour < 15) return t('adminDashboard', 'greetingAfternoon');
    if (hour < 18) return t('adminDashboard', 'greetingEvening');
    return t('adminDashboard', 'greetingNight');
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: t('common', 'active'), className: 'bg-emerald-100 text-emerald-800' },
    inactive: { label: t('common', 'inactive'), className: 'bg-stone-200 text-stone-700' },
    suspended: { label: t('common', 'suspended'), className: 'bg-red-100 text-red-700' },
  };

  const quickActions = [
    { name: t('nav', 'menu'), desc: t('adminDashboard', 'menuDesc'), path: '/admin/menu', icon: UtensilsCrossed, tone: 'bg-primary-100 text-primary-800' },
    { name: t('nav', 'wifi'), desc: t('adminDashboard', 'wifiDesc'), path: '/admin/wifi', icon: Wifi, tone: 'bg-sky-100 text-sky-800' },
    { name: t('nav', 'review'), desc: t('adminDashboard', 'reviewDesc'), path: '/admin/review', icon: Star, tone: 'bg-amber-100 text-amber-800' },
    { name: t('nav', 'qrCode'), desc: t('adminDashboard', 'qrDesc'), path: '/admin/qr', icon: QrCode, tone: 'bg-emerald-100 text-emerald-800' },
  ];

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
      showToast('success', editTarget === 'logo' ? t('adminDashboard', 'logoUpdated') : t('adminDashboard', 'bannerUpdated'));
      setSheetOpen(false);
      await refetch();
    }
  };

  if (loading) return <Loading label={t('common', 'loading')} />;

  if (!selectedBusiness) {
    return (
      <div className="pt-10 flex flex-col items-center text-center px-2">
        <div className="w-20 h-20 rounded-[28px] bg-primary-100 flex items-center justify-center">
          <Plus className="h-10 w-10 text-primary" strokeWidth={2.5} />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-ink tracking-tight">{t('adminDashboard', 'noBusinessTitle')}</h2>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed text-balance">
          {t('adminDashboard', 'noBusinessDesc')}
        </p>
        <Link
          to="/onboarding"
          className="mt-8 h-14 w-full rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" />
          {t('adminDashboard', 'createBusinessBtn')}
        </Link>
      </div>
    );
  }

  const status = statusConfig[selectedBusiness.status] ?? statusConfig.active;

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium text-ink-muted px-1">{getGreeting()}, {t('adminDashboard', 'greetingReady')}</p>

      {/* Profile card */}
      <section className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(23,22,31,0.06)]">
        <div className="relative h-32 bg-primary-100">
          {selectedBusiness.cover_url ? (
            <img src={selectedBusiness.cover_url} alt="" className="w-full h-full object-cover" decoding="async" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-700" />
          )}
          <button
            onClick={() => setSheetOpen(true)}
            className="absolute top-3 right-3 h-9 px-3 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Camera className="w-4 h-4" />
            {t('adminDashboard', 'editPhoto')}
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end gap-3 -mt-9">
            <button
              onClick={() => setSheetOpen(true)}
              className="relative w-[72px] h-[72px] rounded-[22px] bg-ink text-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0"
              aria-label={t('adminDashboard', 'changeLogo')}
            >
              {selectedBusiness.logo_url ? (
                <img src={selectedBusiness.logo_url} alt="" className="w-full h-full object-cover" decoding="async" />
              ) : (
                <span className="text-2xl font-extrabold">{selectedBusiness.name.charAt(0).toUpperCase()}</span>
              )}
            </button>
            <div className="flex gap-1.5 pb-1 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface text-ink-muted">
                {getBusinessTypeMeta(selectedBusiness.business_type, language).label}
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
        <h3 className="px-1 mb-3 text-sm font-bold text-ink">{t('adminDashboard', 'manageBusiness')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
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
          <span className="block text-sm font-bold">{t('adminDashboard', 'printBannerTitle')}</span>
          <span className="block text-xs text-white/70">{t('adminDashboard', 'printBannerDesc')}</span>
        </span>
        <ChevronRight className="w-5 h-5 text-white/60 shrink-0" />
      </Link>

      {/* Edit photo bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={t('adminDashboard', 'editPhoto')}>
          <div className="absolute inset-0 bg-ink/40 animate-scrim" onClick={() => !uploading && setSheetOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[28px] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-sheet-up">
            <div className="w-10 h-1 bg-outline rounded-full mx-auto mb-4" aria-hidden="true" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-ink text-lg">{t('adminDashboard', 'editPhoto')}</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink-muted hover:bg-surface"
                aria-label={t('common', 'close')}
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
                        ? t('adminDashboard', 'uploading')
                        : target === 'cover'
                          ? t('adminDashboard', 'changeBanner')
                          : t('adminDashboard', 'changeLogo')}
                    </span>
                    <span className="block text-xs text-ink-muted">{t('adminDashboard', 'imageFormatTip')}</span>
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
