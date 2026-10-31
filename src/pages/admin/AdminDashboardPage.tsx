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
  Sparkles,
  Clock,
  MessageCircle,
  CreditCard,
  Dumbbell,
  Hotel,
  Scissors,
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'paypal'>('qris');
  const [paymentCycle, setPaymentCycle] = useState<'monthly' | 'yearly'>('yearly');
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
  const isTrial = selectedBusiness.subscription_tier === 'trial' || !selectedBusiness.subscription_tier;
  const trialEndsAt = selectedBusiness.trial_ends_at ? new Date(selectedBusiness.trial_ends_at) : null;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 14;

  const bizNameLower = selectedBusiness.name.toLowerCase();
  const bizSlugLower = selectedBusiness.slug.toLowerCase();
  const isGym = selectedBusiness.business_type === 'gym' ||
    bizNameLower.includes('gym') ||
    bizNameLower.includes('fitness') ||
    bizSlugLower.includes('gym') ||
    bizSlugLower.includes('fitness');
  const isHospitality = ['hotel', 'villa', 'homestay'].includes(selectedBusiness.business_type) ||
    bizNameLower.includes('hotel') ||
    bizNameLower.includes('villa') ||
    bizNameLower.includes('homestay') ||
    bizNameLower.includes('resort');
  const isBeauty = ['salon', 'barbershop'].includes(selectedBusiness.business_type) ||
    bizNameLower.includes('salon') ||
    bizNameLower.includes('barber');

  const planName = isGym
    ? (language === 'id' ? 'Paket Gym & Fitness' : 'Gym & Fitness Plan')
    : isHospitality
    ? (language === 'id' ? 'Paket Hotel & Hospitality' : 'Hotel & Hospitality Plan')
    : (language === 'id' ? 'Paket Kafe & Resto' : 'Cafe & Dining Plan');
  const planPrice = isHospitality
    ? (paymentCycle === 'yearly' ? 'Rp 1.428.000 / thn' : 'Rp 149.000 / bln')
    : (paymentCycle === 'yearly' ? 'Rp 588.000 / thn' : 'Rp 69.000 / bln');
  const planUsd = isHospitality
    ? (paymentCycle === 'yearly' ? '$99 USD / year' : '$12 USD / month')
    : (paymentCycle === 'yearly' ? '$45 USD / year' : '$5 USD / month');

  const dynamicQuickActions = [
    {
      name: isGym
        ? (language === 'id' ? 'Paket & Layanan' : 'Plans & Services')
        : isHospitality
        ? (language === 'id' ? 'Katalog & Layanan' : 'Directory & Services')
        : isBeauty
        ? (language === 'id' ? 'Price List & Layanan' : 'Services & Rates')
        : t('nav', 'menu'),
      desc: isGym
        ? (language === 'id' ? 'Membership & kelas gym' : 'Memberships & gym classes')
        : isHospitality
        ? (language === 'id' ? 'Room service & fasilitas' : 'Room service & amenities')
        : isBeauty
        ? (language === 'id' ? 'Treatment & perawatan' : 'Treatments & haircuts')
        : t('adminDashboard', 'menuDesc'),
      path: '/admin/menu',
      icon: isGym ? Dumbbell : isHospitality ? Hotel : isBeauty ? Scissors : UtensilsCrossed,
      tone: 'bg-primary-100 text-primary-800',
    },
    { name: t('nav', 'wifi'), desc: t('adminDashboard', 'wifiDesc'), path: '/admin/wifi', icon: Wifi, tone: 'bg-sky-100 text-sky-800' },
    { name: t('nav', 'review'), desc: t('adminDashboard', 'reviewDesc'), path: '/admin/review', icon: Star, tone: 'bg-amber-100 text-amber-800' },
    { name: t('nav', 'qrCode'), desc: t('adminDashboard', 'qrDesc'), path: '/admin/qr', icon: QrCode, tone: 'bg-emerald-100 text-emerald-800' },
  ];

  const waText = encodeURIComponent(
    language === 'id'
      ? `Halo Admin SmartQR, saya ingin konfirmasi pembayaran langganan SmartQR:\n\nBisnis: ${selectedBusiness.name}\nSlug: ${selectedBusiness.slug}\nPaket: ${planName} (${paymentCycle === 'yearly' ? 'Tahunan' : 'Bulanan'})\nMetode: ${paymentMethod.toUpperCase()}`
      : `Hello SmartQR Admin, I would like to confirm my SmartQR subscription payment:\n\nBusiness: ${selectedBusiness.name}\nSlug: ${selectedBusiness.slug}\nPlan: ${planName} (${paymentCycle === 'yearly' ? 'Yearly' : 'Monthly'})\nMethod: ${paymentMethod.toUpperCase()}`
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-ink-muted">{getGreeting()}, {t('adminDashboard', 'greetingReady')}</p>
        <button
          onClick={() => setPaymentModalOpen(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>
            {isTrial
              ? (language === 'id' ? 'Status: Trial 14 Hari' : 'Status: 14-Day Free Trial')
              : (language === 'id' ? `Paket: ${selectedBusiness.subscription_tier}` : `Plan: ${selectedBusiness.subscription_tier}`)}
          </span>
        </button>
      </div>

      {/* Trial Countdown Alert Banner */}
      {isTrial && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-[28px] p-4 sm:p-5 text-stone-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-stone-950/15 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-stone-950 text-amber-300 px-2.5 py-0.5 rounded-full">
                  {language === 'id' ? 'FREE TRIAL' : 'FREE TRIAL'}
                </span>
                <span className="text-xs font-black text-stone-950">
                  {daysLeft > 0
                    ? (language === 'id' ? `Sisa ${daysLeft} Hari Lagi` : `${daysLeft} Days Remaining`)
                    : (language === 'id' ? 'Masa Trial Berakhir Hari Ini' : 'Trial Expires Today')}
                </span>
              </div>
              <p className="text-xs font-medium text-stone-950/85 mt-1 leading-relaxed">
                {language === 'id'
                  ? 'Nikmati fitur QR meja tanpa batas. Aktifkan paket langganan resmi untuk memastikan QR terus aktif.'
                  : 'Enjoy unlimited table QR features. Activate your official plan to keep your QR codes active.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-300 text-xs font-extrabold shadow-md active:scale-95 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'id' ? 'Upgrade Langganan' : 'Upgrade Plan'}</span>
          </button>
        </div>
      )}

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
                {getBusinessTypeMeta(selectedBusiness.business_type, language, selectedBusiness.name).label}
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
          {dynamicQuickActions.map((a) => (
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

      {/* Upgrade & Payment Modal (QRIS & PayPal) */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl relative border border-stone-100 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-8 h-8 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-extrabold text-ink">
                {language === 'id' ? 'Aktivasi Langganan' : 'Activate Subscription'}
              </h3>
            </div>
            <p className="text-xs text-ink-muted mb-4">
              {language === 'id'
                ? `Pilih periode dan metode pembayaran untuk bisnis ${selectedBusiness.name}`
                : `Choose billing cycle and payment method for ${selectedBusiness.name}`}
            </p>

            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-surface border border-outline/60 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink">{planName}</span>
                <span className="text-xs font-extrabold text-primary">{planPrice}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentCycle('monthly')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    paymentCycle === 'monthly'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-ink-muted border border-outline/60'
                  }`}
                >
                  {language === 'id' ? 'Bulanan' : 'Monthly'}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCycle('yearly')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    paymentCycle === 'yearly'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-ink-muted border border-outline/60'
                  }`}
                >
                  {language === 'id' ? 'Tahunan (Hemat 2 Bulan)' : 'Yearly (Save 2 Months)'}
                </button>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="flex rounded-2xl bg-stone-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'qris'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {language === 'id' ? '🇮🇩 QRIS & Transfer Bank' : '🇮🇩 QRIS & Bank Transfer'}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {language === 'id' ? '🌍 PayPal (Internasional)' : '🌍 PayPal (USD / Intl)'}
              </button>
            </div>

            {/* QRIS Tab */}
            {paymentMethod === 'qris' && (
              <div className="space-y-4 text-center">
                <div className="p-3 rounded-2xl bg-white border border-stone-200 inline-block shadow-md">
                  <img
                    src="/qris-payment.jpg"
                    alt="QRIS Sehat Pro Digital & Kreatif"
                    className="w-56 mx-auto rounded-xl shadow-sm object-contain"
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xs font-black text-stone-900 tracking-tight">SEHAT PRO, DIGITAL & KREATIF</p>
                    <p className="text-[10px] text-stone-500 font-mono">NMID: ID1025418493371</p>
                  </div>
                </div>

                <div className="text-left p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-1.5">
                  <p className="font-bold text-amber-950">
                    {language === 'id' ? 'Cara Pembayaran QRIS:' : 'How to Pay via QRIS:'}
                  </p>
                  <p className="text-amber-900 leading-relaxed text-[11px]">
                    {language === 'id' ? (
                      <>
                        1. Buka m-Banking (BCA, Mandiri, BRI) atau e-Wallet (GoPay, OVO, ShopeePay, DANA).<br />
                        2. Scan QRIS di atas dan masukkan nominal <strong>{planPrice}</strong>.<br />
                        3. Klik tombol WhatsApp di bawah untuk konfirmasi aktivasi instan.
                      </>
                    ) : (
                      <>
                        1. Open any Indonesian m-Banking (BCA, Mandiri, BRI) or e-Wallet (GoPay, OVO, DANA).<br />
                        2. Scan the QRIS code above and enter the exact total <strong>{planPrice}</strong>.<br />
                        3. Click the WhatsApp button below for instant confirmation.
                      </>
                    )}
                  </p>
                </div>

                <a
                  href={`https://wa.me/6285854203343?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {language === 'id'
                      ? 'Kirim Bukti Pembayaran ke WhatsApp (085854203343)'
                      : 'Send Payment Proof via WhatsApp (085854203343)'}
                  </span>
                </a>
              </div>
            )}

            {/* PayPal Tab */}
            {paymentMethod === 'paypal' && (
              <div className="space-y-4 text-center py-2">
                <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                    <span>International Card / PayPal</span>
                  </div>
                  <p className="text-xs text-sky-800">
                    {language === 'id'
                      ? 'Kirim pembayaran via PayPal atau kartu kredit internasional ke akun resmi kami:'
                      : 'Send payment via PayPal or international credit/debit card to our official account:'}
                  </p>
                  <div className="p-2.5 rounded-xl bg-white border border-sky-100 flex items-center justify-between">
                    <span className="text-xs text-stone-600">PayPal Email:</span>
                    <strong className="text-xs font-mono text-sky-950 font-bold">rwinjember@gmail.com</strong>
                  </div>
                  <div className="pt-2 border-t border-sky-200/60 flex justify-between items-center text-xs">
                    <span className="text-sky-900 font-semibold">
                      {language === 'id' ? 'Total Tagihan:' : 'Total Billed:'}
                    </span>
                    <span className="font-extrabold text-sm text-sky-950">{planUsd}</span>
                  </div>
                </div>

                <a
                  href="https://paypal.me/harwinariyanto1"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{language === 'id' ? 'Buka PayPal (paypal.me/harwinariyanto1)' : 'Open PayPal (paypal.me/harwinariyanto1)'}</span>
                </a>

                <a
                  href={`https://wa.me/6285854203343?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'id'
                      ? 'Konfirmasi Pembayaran PayPal via WhatsApp'
                      : 'Confirm PayPal Payment via WhatsApp'}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
