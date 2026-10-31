import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode,
  Wifi,
  Utensils,
  Star,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Coffee,
  Hotel,
  Scissors,
  Dumbbell,
  X,
  MessageCircle,
  Printer,
  Radio,
  Lock,
  ChevronDown
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { registerBusinessSelfServe } from '../lib/business/service'
import type { BusinessType } from '../types'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

const LANDING_I18N = {
  id: {
    nav: {
      features: 'Fitur',
      forBusiness: 'Untuk Bisnis',
      liveDemo: 'Live Demo',
      pricing: 'Harga',
      faq: 'FAQ',
      login: 'Masuk',
      startTrial: 'Coba Gratis 14 Hari',
    },
    hero: {
      tag: 'Smart QR Meja All-in-One Generasi Terbaru',
      tagBadge: 'FREE 14 HARI',
      title1: 'Sulap Meja Bisnis Anda Jadi',
      titleHighlight: 'Mesin Penjualan & Review Bintang 5',
      subtitle: '1 QR Code di setiap meja: Menu digital interaktif (foto & video), Auto-connect WiFi 1-tap tanpa ditanya password, dan booster ulasan Google Maps otomatis. Tanpa perlu download aplikasi.',
      ctaPrimary: 'Daftar Coba Gratis Sekarang',
      ctaSecondary: 'Scan Live Demo',
      trust1: 'Setup 15 Menit Jadi',
      trust2: 'Unlimited Meja & Kunjungan',
      trust3: 'Tanpa Kartu Kredit',
      trust4: 'NFC & Standee Ready',
      previewTag: 'Tampilan Tamu Saat Scan di Meja',
      previewTitle: 'Satu QR untuk Semua Kebutuhan Pelanggan di Meja',
      previewDesc: 'Begitu tamu duduk, mereka scan QR standee akrilik di meja. Mereka langsung bisa memilih menu makanan/minuman lezat, langsung connect WiFi tanpa ribet ngetik password, dan memberi rating bintang 5 di Google Maps.',
      step1: 'Menu PWA Cepat dengan Foto & Video menggugah selera',
      step2: 'WiFi 1-Tap Connect (Bebas repot jawab password tiap menit)',
      step3: 'Review Booster otomatis menaikkan ranking Google Maps',
      demoWelcome: 'Selamat Datang di',
      demoMenu: 'Lihat Menu Makanan',
      demoMenuDesc: 'Pilihan favorit & promo',
      demoWifi: 'Sambungkan WiFi',
      demoWifiDesc: '1-Klik langsung connect',
      demoReview: 'Beri Ulasan Google',
      demoReviewDesc: 'Review bintang 5',
    },
    liveDemo: {
      tag: 'Tes Langsung Sekarang',
      title: 'Arahkan Kamera HP Anda ke QR Code Ini',
      desc: 'Buktikan sendiri kemudahan dan kecepatannya. Tanpa install aplikasi apa pun, Anda akan langsung masuk ke halaman demo Customer Hub dan merasakan betapa mulusnya pengalaman pelanggan kafe/hotel Anda nanti.',
      step1Title: 'Langkah 1',
      step1Desc: 'Buka Kamera HP',
      step2Title: 'Langkah 2',
      step2Desc: 'Scan QR di Layar',
      step3Title: 'Langkah 3',
      step3Desc: 'Nikmati Hub PWA',
      qrBottom: 'Scan untuk Tes Customer Hub',
      qrSub: 'atau buka demo di browser',
      qrDirect: 'Buka Link Demo Langsung →',
    },
    features: {
      tag: 'Fitur Lengkap',
      title: 'Semua yang Dibutuhkan untuk Operasional Modern',
      desc: 'Tingkatkan omset, hemat jutaan biaya cetak menu, dan rawat kepuasan pelanggan dengan teknologi cerdas.',
      f1Title: 'Menu Digital (PWA)',
      f1Desc: 'Dukung foto HD & video menu. Update harga, promo, dan status menu habis detik itu juga tanpa perlu cetak ulang lembaran buku menu.',
      f1Badge: 'Hemat biaya cetak 100%',
      f2Title: 'WiFi 1-Tap Auto Connect',
      f2Desc: 'Pelanggan cukup klik satu tombol untuk langsung tersambung ke WiFi kafe atau kamar hotel tanpa perlu tanya password ke waiter.',
      f2Badge: 'Bebas antrean tanya password',
      f3Title: 'Google Review Booster',
      f3Desc: 'Filter rating cerdas: Ulasan bintang 5 otomatis diarahkan ke Google Maps untuk mendongkrak reputasi. Kritik/rating rendah disaring secara internal.',
      f3Badge: 'Lindungi rating bintang 4.8+',
      f4Title: 'Standee Siap Cetak & NFC',
      f4Desc: 'Download template akrilik meja resolusi tinggi siap cetak (A6/A5). Langsung bisa ditempelkan chip NFC untuk pengalaman sentuh HP.',
      f4Badge: 'Tanpa sewa desainer grafis',
    },
    industry: {
      tag: 'Sistem Adaptif',
      title: 'Menyesuaikan Secara Otomatis dengan Bidang Bisnis Anda',
      desc: 'Satu platform cerdas dengan istilah & fungsi yang otomatis menyesuaikan jenis usaha Anda.',
      cafe: 'Kafe & Resto',
      hotel: 'Hotel & Villa',
      salon: 'Salon & Barbershop',
      gym: 'Gym & Fitness',
    },
    pricing: {
      tag: 'Investasi Terjangkau',
      title: 'Harga Flat & Transparan Tanpa Biaya Tersembunyi',
      desc: 'Coba gratis 14 hari penuh. Bebas berapa pun jumlah meja di outlet Anda.',
      monthly: 'Bayar Bulanan',
      yearly: 'Bayar Tahunan',
      saveBadge: 'Hemat 2 Bulan',
      card1Title: 'Free Trial',
      card1Subtitle: 'Eksplorasi seluruh fitur tanpa risiko.',
      card1Price: 'Rp 0',
      card1Per: '/ 14 hari penuh',
      card1Btn: 'Mulai Uji Coba Gratis',
      card2Badge: 'Paling Populer ⭐',
      card2Title: 'Kafe & Restoran',
      card2Subtitle: 'Solusi lengkap untuk 1 outlet kafe / resto.',
      card2YearlyNote: 'Ditagih tahunan Rp 588.000 (Hemat 2 bulan)',
      card2Btn: 'Daftar Sekarang (14 Hari Free)',
      card3Title: 'Hotel & Villa',
      card3Subtitle: 'Direktori kamar, room service & resort.',
      card3YearlyNote: 'Ditagih tahunan Rp 1.428.000',
      card3Btn: 'Mulai Uji Coba Hotel',
      perMonth: '/ bulan',
      secureBarTitle: 'Metode Pembayaran Aman & Lengkap',
      secureBarDesc: 'Mendukung QRIS (BCA, Mandiri, GoPay, OVO, DANA) & PayPal / Kartu Internasional.',
    },
    modal: {
      title: 'Daftar Akun Baru',
      desc: 'Mulai gratis 14 hari. Akun Anda langsung aktif dalam 30 detik!',
      nameLabel: 'Nama Bisnis / Kafe / Hotel',
      namePlaceholder: 'Contoh: Kopi Senja Utama',
      slugLabel: 'URL / Link Meja',
      slugTip: 'URL ini akan di-scan oleh pelanggan di meja kafe/kamar Anda.',
      typeLabel: 'Tipe Bisnis',
      waLabel: 'Nomor WhatsApp Pemilik / Kasir',
      pinLabel: 'Buat PIN Login (4 - 6 Digit)',
      pinSub: 'Untuk login admin',
      btnLoading: 'Membuat Akun & Masuk Dashboard...',
      btnSubmit: 'Mulai Coba Gratis 14 Hari',
    },
    bottomCta: {
      title: 'Siap Mengubah Meja Kafe atau Hotel Anda?',
      desc: 'Daftar sekarang dan rasakan pengalaman SmartQR di meja bisnis Anda dalam 15 menit. Gratis 14 hari tanpa biaya komitmen.',
      btnTrial: 'Mulai Uji Coba 14 Hari Gratis',
      btnWa: 'Konsultasi via WhatsApp',
    }
  },
  en: {
    nav: {
      features: 'Features',
      forBusiness: 'For Business',
      liveDemo: 'Live Demo',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Login',
      startTrial: 'Start 14-Day Free Trial',
    },
    hero: {
      tag: 'Next-Gen All-in-One Smart QR Table Experience',
      tagBadge: '14 DAYS FREE',
      title1: 'Turn Your Business Tables into a',
      titleHighlight: '5-Star Sales & Review Machine',
      subtitle: '1 QR Code on every table: Interactive digital PWA menu (photo & video), 1-Tap WiFi Auto-Connect without typing passwords, and automatic Google Maps review booster. No app download needed.',
      ctaPrimary: 'Start 14-Day Free Trial Now',
      ctaSecondary: 'Scan Live Demo',
      trust1: '15-Minute Setup',
      trust2: 'Unlimited Tables & Scans',
      trust3: 'No Credit Card Required',
      trust4: 'NFC & Standee Ready',
      previewTag: 'Guest Experience Upon Scanning',
      previewTitle: 'One QR for All Table Customer Needs',
      previewDesc: 'As soon as guests sit down, they scan the acrylic standee QR on the table. They can browse delicious items, connect to WiFi with 1-click, and leave a 5-star Google Maps review effortlessly.',
      step1: 'Fast PWA Menu with Mouthwatering HD Photos & Videos',
      step2: '1-Tap WiFi Connect (No more asking waiters for password)',
      step3: 'Smart Review Booster automatically boosts Google ranking',
      demoWelcome: 'Welcome to',
      demoMenu: 'Browse Digital Menu',
      demoMenuDesc: 'Favorites & special promos',
      demoWifi: 'Connect to WiFi',
      demoWifiDesc: '1-Click instant connection',
      demoReview: 'Leave Google Review',
      demoReviewDesc: '5-Star rating booster',
    },
    liveDemo: {
      tag: 'Try It Right Now',
      title: 'Point Your Phone Camera at This QR Code',
      desc: 'Experience the speed and seamless flow yourself. Without installing any app, you will enter the Customer Hub demo and feel how smooth your customers’ experience will be.',
      step1Title: 'Step 1',
      step1Desc: 'Open Phone Camera',
      step2Title: 'Step 2',
      step2Desc: 'Scan Screen QR Code',
      step3Title: 'Step 3',
      step3Desc: 'Enjoy PWA Hub',
      qrBottom: 'Scan to Test Customer Hub',
      qrSub: 'or open demo in browser',
      qrDirect: 'Open Direct Demo Link →',
    },
    features: {
      tag: 'Full Feature Suite',
      title: 'Everything Needed for Modern Hospitality',
      desc: 'Boost revenue, eliminate menu printing expenses, and nurture customer satisfaction with intelligent technology.',
      f1Title: 'Interactive PWA Menu',
      f1Desc: 'Supports HD photos & video menus. Instantly update prices, promos, and sold-out badges without reprinting paper menus.',
      f1Badge: 'Save 100% on printing costs',
      f2Title: '1-Tap WiFi Auto-Connect',
      f2Desc: 'Guests tap once to immediately connect to cafe or room WiFi without asking waiters for complicated passwords.',
      f2Badge: 'No password queues',
      f3Title: 'Google Review Booster',
      f3Desc: 'Smart satisfaction shield: 5-star ratings are seamlessly routed to Google Maps. Constructive criticism is handled privately.',
      f3Badge: 'Protect your 4.8+ star rating',
      f4Title: 'Print-Ready Standee & NFC',
      f4Desc: 'Download high-res acrylic standee designs (A6/A5). Fully compatible with NFC coin tags for tap-to-open experience.',
      f4Badge: 'No graphic designer needed',
    },
    industry: {
      tag: 'Adaptive Architecture',
      title: 'Automatically Adapts to Your Business Sector',
      desc: 'One intelligent platform whose terminology and layout adapt to your venue type.',
      cafe: 'Cafe & Resto',
      hotel: 'Hotel & Villa',
      salon: 'Salon & Barbershop',
      gym: 'Gym & Fitness',
    },
    pricing: {
      tag: 'Transparent Pricing',
      title: 'Flat & Transparent Rates Without Hidden Fees',
      desc: 'Full 14-day free trial. Unlimited tables across your entire location.',
      monthly: 'Billed Monthly',
      yearly: 'Billed Yearly',
      saveBadge: 'Save 2 Months',
      card1Title: 'Free Trial',
      card1Subtitle: 'Explore all features risk-free.',
      card1Price: '$0',
      card1Per: '/ full 14 days',
      card1Btn: 'Start Free Trial',
      card2Badge: 'Most Popular ⭐',
      card2Title: 'Cafe & Restaurant',
      card2Subtitle: 'Complete solution for 1 cafe or restaurant outlet.',
      card2YearlyNote: 'Billed yearly $45 / year (Save 2 months)',
      card2Btn: 'Register Now (14 Days Free)',
      card3Title: 'Hotel & Villa',
      card3Subtitle: 'Room directory, amenities & resort dining.',
      card3YearlyNote: 'Billed yearly $99 / year',
      card3Btn: 'Start Hotel Trial',
      perMonth: '/ month',
      secureBarTitle: 'Secure & Comprehensive Payment Methods',
      secureBarDesc: 'Supports Indonesian QRIS (SEHAT PRO DIGITAL) and International PayPal.',
    },
    modal: {
      title: 'Register New Account',
      desc: 'Start 14 days free. Your account is active in 30 seconds!',
      nameLabel: 'Business / Cafe / Hotel Name',
      namePlaceholder: 'e.g. Sunset Coffee Bar',
      slugLabel: 'URL / Table Link',
      slugTip: 'This link will be encoded in the QR code on your tables/rooms.',
      typeLabel: 'Business Sector',
      waLabel: 'Owner / Staff WhatsApp Number',
      pinLabel: 'Create Admin PIN (4 - 6 Digits)',
      pinSub: 'For staff login',
      btnLoading: 'Creating Account & Entering Dashboard...',
      btnSubmit: 'Start 14-Day Free Trial',
    },
    bottomCta: {
      title: 'Ready to Transform Your Tables or Rooms?',
      desc: 'Sign up now and experience SmartQR live in your business within 15 minutes. 14 days free with zero commitment.',
      btnTrial: 'Start 14-Day Free Trial',
      btnWa: 'Consult via WhatsApp',
    }
  }
}

export default function LandingPage() {
  const { language } = useLanguage()
  const tr = LANDING_I18N[language] || LANDING_I18N.id

  // State for Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [activeTabIndustry, setActiveTabIndustry] = useState<'cafe' | 'hotel' | 'salon' | 'gym'>('cafe')

  // Registration Form State
  const [bizName, setBizName] = useState('')
  const [bizSlug, setBizSlug] = useState('')
  const [bizType, setBizType] = useState<BusinessType>('cafe')
  const [bizWhatsapp, setBizWhatsapp] = useState('')
  const [bizPin, setBizPin] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  // Demo QR Target
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartqr.app'
  const demoUrl = `${origin}/q/demo-cafe`

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Handle Slug Auto Generate
  const handleNameChange = (val: string) => {
    setBizName(val)
    if (!bizSlug || bizSlug === slugify(bizName)) {
      setBizSlug(slugify(val))
    }
  }

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Handle Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bizName.trim() || !bizSlug.trim() || !bizPin.trim()) {
      setRegError(language === 'id' ? 'Mohon lengkapi Nama Bisnis, URL Slug, dan PIN Akses' : 'Please fill Business Name, Slug, and PIN')
      return
    }
    if (bizPin.length < 4) {
      setRegError(language === 'id' ? 'PIN minimal 4 - 6 digit angka' : 'PIN must be at least 4 - 6 digits')
      return
    }

    setIsRegistering(true)
    setRegError(null)

    try {
      const { data, error } = await registerBusinessSelfServe({
        name: bizName.trim(),
        slug: slugify(bizSlug),
        business_type: bizType,
        whatsapp: bizWhatsapp.trim() || undefined,
        pin: bizPin.trim(),
      })

      if (error || !data) {
        throw new Error(error?.message || (language === 'id' ? 'Gagal mendaftarkan bisnis. Silakan coba slug lain.' : 'Failed to register business. Please choose another slug.'))
      }

      // Store active business id in sessionStorage and go to admin dashboard
      sessionStorage.setItem('smartqr_selected_business_id', data.id)
      localStorage.setItem(`smartqr_pin_${data.slug}`, bizPin.trim())

      // Redirect to admin dashboard
      window.location.href = '/admin'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (language === 'id' ? 'Terjadi kesalahan sistem' : 'System error')
      setRegError(msg)
    } finally {
      setIsRegistering(false)
    }
  }

  // FAQ Items
  const faqItems = language === 'id' ? [
    {
      q: 'Apakah harga langganan dihitung per meja?',
      a: 'TIDAK! Biaya langganan SmartQR berlaku Flat per Outlet / Cabang. Anda bebas mencetak dan memasang QR di 5 meja, 30 meja, hingga 100 meja tanpa ada biaya tambahan sama sekali.',
    },
    {
      q: 'Bagaimana cara pelanggan menggunakan SmartQR?',
      a: 'Sangat mudah! Pelanggan cukup mengarahkan kamera smartphone mereka ke QR code di meja. Sistem langsung terbuka instan (PWA) tanpa perlu download aplikasi dari Play Store atau App Store.',
    },
    {
      q: 'Apakah saya bisa mencetak sendiri standee QR mejanya?',
      a: 'Bisa banget! Dashboard SmartQR sudah menyediakan fitur generate desain standee akrilik siap cetak ukuran A6 & A5 resolusi tinggi. Anda tinggal download PDF/gambarnya dan bawa ke percetakan terdekat.',
    },
    {
      q: 'Bagaimana jika ingin menambahkan chip NFC?',
      a: 'SmartQR 100% kompatibel dengan NFC! Anda cukup menempelkan stiker chip NFC (NTAG213/215) di balik standee akrilik dan membakar link QR meja Anda. Tamu tinggal menempelkan HP untuk membuka menu.',
    },
    {
      q: 'Setelah masa trial 14 hari selesai, apa yang terjadi?',
      a: 'Data bisnis dan menu Anda tetap aman tersimpan. Anda cukup memilih paket langganan (Bulanan / Tahunan) via QRIS atau PayPal untuk mengaktifkan kembali akses publik.',
    },
  ] : [
    {
      q: 'Is subscription pricing calculated per table?',
      a: 'NO! SmartQR subscription is flat per venue/outlet. You can print and place QR standees on 5, 30, or 100 tables with zero extra fees.',
    },
    {
      q: 'How do customers use SmartQR at tables?',
      a: 'Super simple! Guests scan the table QR standee with their phone camera. The PWA opens instantly with no app store download required.',
    },
    {
      q: 'Can I print my own table QR standees?',
      a: 'Absolutely! The dashboard provides print-ready A6/A5 acrylic standee artwork in high resolution. Download and print locally anytime.',
    },
    {
      q: 'Can I add NFC chips to table standees?',
      a: 'Yes, 100% compatible! Stick standard NTAG213/215 NFC tags behind the acrylic standee and write your table URL. Guests can tap to open.',
    },
    {
      q: 'What happens when the 14-day trial ends?',
      a: 'All your menu items and settings remain safe. You can activate monthly or yearly plans anytime via QRIS or PayPal.',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 overflow-x-hidden">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-[800px] -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px]" />
        <div className="absolute top-[1600px] -right-40 w-[600px] h-[500px] bg-amber-500/10 rounded-full blur-[160px]" />
      </div>

      {/* ============================================================== */}
      {/* 1. NAVBAR */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-stone-950/80 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/25">
              <QrCode className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Smart<span className="text-amber-400">QR</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  PWA
                </span>
              </span>
              <p className="text-[10px] text-stone-400 hidden sm:block -mt-0.5">Customer Experience Platform</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-300">
            <a href="#fitur" className="hover:text-amber-400 transition-colors">{tr.nav.features}</a>
            <a href="#industri" className="hover:text-amber-400 transition-colors">{tr.nav.forBusiness}</a>
            <a href="#demo" className="hover:text-amber-400 transition-colors">{tr.nav.liveDemo}</a>
            <a href="#harga" className="hover:text-amber-400 transition-colors">{tr.nav.pricing}</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">{tr.nav.faq}</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <LanguageToggle variant="button" className="bg-stone-900 border-stone-800 text-stone-200" />
            <Link
              to="/admin/login"
              className="px-4 py-2 text-sm font-bold text-stone-200 hover:text-white hover:bg-stone-900 rounded-xl transition-all"
            >
              {tr.nav.login}
            </Link>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{tr.nav.startTrial}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. HERO SECTION */}
      {/* ============================================================== */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Top Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 shadow-inner mb-6 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-stone-300">
            {tr.hero.tag}
          </span>
          <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded-full ml-1">
            {tr.hero.tagBadge}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] text-balance">
          {tr.hero.title1}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
            {tr.hero.titleHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-stone-400 max-w-3xl mx-auto leading-relaxed text-pretty">
          {tr.hero.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            <span>{tr.hero.ctaPrimary}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#demo"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 text-stone-200 font-bold text-base hover:border-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Smartphone className="w-5 h-5 text-amber-400" />
            <span>{tr.hero.ctaSecondary}</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-stone-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{tr.hero.trust1}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{tr.hero.trust2}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{tr.hero.trust3}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{tr.hero.trust4}</span>
          </div>
        </div>

        {/* Hero Visual: Interactive Smartphone Mockup */}
        <div className="mt-14 relative max-w-4xl mx-auto">
          <div className="p-2 sm:p-4 rounded-[40px] bg-gradient-to-b from-stone-800/80 via-stone-900/50 to-stone-950 border border-stone-800 shadow-2xl backdrop-blur-md">
            <div className="rounded-[32px] overflow-hidden bg-stone-900 border border-stone-800/60 p-6 sm:p-10 text-left">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Side: Explanation */}
                <div className="md:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    {tr.hero.previewTag}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {tr.hero.previewTitle}
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    {tr.hero.previewDesc}
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">1</div>
                      <span>{tr.hero.step1}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <div className="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-400 flex items-center justify-center font-bold">2</div>
                      <span>{tr.hero.step2}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold">3</div>
                      <span>{tr.hero.step3}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Phone Hub UI Mockup Preview */}
                <div className="md:col-span-5 flex justify-center">
                  <div className="w-[280px] rounded-[36px] bg-stone-900 border-4 border-stone-800 shadow-2xl overflow-hidden p-3 relative">
                    <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto mb-3" />
                    
                    {/* Simulated Hub Header */}
                    <div className="h-28 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-4 text-stone-950 flex flex-col justify-end relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-stone-950/20 text-[9px] font-bold text-white">
                        Demo
                      </div>
                      <p className="text-xs font-semibold opacity-90">{tr.hero.demoWelcome}</p>
                      <h4 className="text-base font-extrabold text-stone-950">Kopi Senja Utama ☕</h4>
                    </div>

                    {/* Simulated 3 Main Actions */}
                    <div className="space-y-2.5 mt-3">
                      <div className="p-3 bg-stone-800/90 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white">{tr.hero.demoMenu}</p>
                          <p className="text-[10px] text-stone-400">{tr.hero.demoMenuDesc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </div>

                      <div className="p-3 bg-stone-800/90 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                          <Wifi className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white">{tr.hero.demoWifi}</p>
                          <p className="text-[10px] text-stone-400">{tr.hero.demoWifiDesc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </div>

                      <div className="p-3 bg-stone-800/90 rounded-2xl border border-stone-700/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white">{tr.hero.demoReview}</p>
                          <p className="text-[10px] text-stone-400">{tr.hero.demoReviewDesc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </div>
                    </div>

                    <div className="mt-4 py-1 text-center">
                      <span className="text-[10px] text-stone-500">Powered by SmartQR PWA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LIVE QR SCAN DEMO */}
      {/* ============================================================== */}
      <section id="demo" className="relative z-10 py-20 bg-stone-900/60 border-y border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 rounded-[36px] border border-stone-700/60 p-8 sm:p-14 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                  <Smartphone className="w-4 h-4" />
                  {tr.liveDemo.tag}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  {tr.liveDemo.title}
                </h2>
                <p className="text-stone-400 text-base leading-relaxed">
                  {tr.liveDemo.desc}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <p className="text-xs font-semibold text-stone-400">{tr.liveDemo.step1Title}</p>
                    <p className="text-sm font-bold text-white mt-1">{tr.liveDemo.step1Desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <p className="text-xs font-semibold text-stone-400">{tr.liveDemo.step2Title}</p>
                    <p className="text-sm font-bold text-white mt-1">{tr.liveDemo.step2Desc}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <p className="text-xs font-semibold text-stone-400">{tr.liveDemo.step3Title}</p>
                    <p className="text-sm font-bold text-white mt-1">{tr.liveDemo.step3Desc}</p>
                  </div>
                </div>
              </div>

              {/* Right QR Box */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-amber-500/10 flex flex-col items-center">
                  <div className="p-2 bg-white rounded-xl">
                    <QRCodeSVG
                      value={demoUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs font-extrabold text-stone-900 mt-4 tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {tr.liveDemo.qrBottom}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{tr.liveDemo.qrSub}</p>
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    {tr.liveDemo.qrDirect}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. CORE FEATURES (4 PILARS) */}
      {/* ============================================================== */}
      <section id="fitur" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase">{tr.features.tag}</h2>
          <p className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {tr.features.title}
          </p>
          <p className="mt-4 text-stone-400 text-base">
            {tr.features.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-7 rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{tr.features.f1Title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              {tr.features.f1Desc}
            </p>
            <div className="mt-5 pt-4 border-t border-stone-800/80 text-xs text-amber-400/90 font-semibold flex items-center gap-1.5">
              <span>{tr.features.f1Badge}</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-7 rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-sky-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-13 h-13 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wifi className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{tr.features.f2Title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              {tr.features.f2Desc}
            </p>
            <div className="mt-5 pt-4 border-t border-stone-800/80 text-xs text-sky-400/90 font-semibold flex items-center gap-1.5">
              <span>{tr.features.f2Badge}</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-7 rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-yellow-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-13 h-13 rounded-2xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{tr.features.f3Title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              {tr.features.f3Desc}
            </p>
            <div className="mt-5 pt-4 border-t border-stone-800/80 text-xs text-yellow-400/90 font-semibold flex items-center gap-1.5">
              <span>{tr.features.f3Badge}</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-7 rounded-3xl bg-stone-900/80 border border-stone-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group">
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Printer className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{tr.features.f4Title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              {tr.features.f4Desc}
            </p>
            <div className="mt-5 pt-4 border-t border-stone-800/80 text-xs text-emerald-400/90 font-semibold flex items-center gap-1.5">
              <span>{tr.features.f4Badge}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. ADAPTIVE FOR ALL BUSINESSES (KAFE, HOTEL, SALON, GYM) */}
      {/* ============================================================== */}
      <section id="industri" className="relative z-10 py-20 bg-stone-900/40 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase">{tr.industry.tag}</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
              {tr.industry.title}
            </p>
            <p className="mt-3 text-stone-400 text-sm">
              {tr.industry.desc}
            </p>
          </div>

          {/* Industry Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTabIndustry('cafe')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTabIndustry === 'cafe'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>{tr.industry.cafe}</span>
            </button>
            <button
              onClick={() => setActiveTabIndustry('hotel')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTabIndustry === 'hotel'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>{tr.industry.hotel}</span>
            </button>
            <button
              onClick={() => setActiveTabIndustry('salon')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTabIndustry === 'salon'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>{tr.industry.salon}</span>
            </button>
            <button
              onClick={() => setActiveTabIndustry('gym')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTabIndustry === 'gym'
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>{tr.industry.gym}</span>
            </button>
          </div>

          {/* Active Tab Preview Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 border border-stone-800">
            {activeTabIndustry === 'cafe' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{language === 'id' ? 'Untuk Kafe & Restoran' : 'For Cafes & Restaurants'}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    {language === 'id' ? 'Menu Meja Interaktif & Order Cepat' : 'Interactive Digital Menu & Fast Ordering'}
                  </h3>
                  <p className="mt-3 text-stone-400 text-sm leading-relaxed">
                    {language === 'id' 
                      ? 'Tamu kafe bisa langsung melihat daftar menu makanan & minuman dengan foto HD, menandai item favorit, dan connect ke WiFi kafe hanya dengan 1 tap. Pelanggan puas langsung diarahkan memberi bintang 5 di Google Maps.'
                      : 'Guests browse delicious food & drink items with HD photos, mark favorites, and connect to cafe WiFi with 1-tap. Happy guests are routed to 5-star Google reviews.'}
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-stone-300">
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Kategori Makanan, Minuman, Snack, Promo' : 'Food, Drinks, Snacks, and Promo Categories'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Toggle item Habis/Sold Out secara realtime' : 'Real-time Sold Out toggles'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Auto connect WiFi kafe di meja' : 'Table 1-Tap WiFi Auto Connect'}</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-center text-center">
                  <div className="text-4xl mb-3">☕🍽️</div>
                  <h4 className="text-lg font-bold text-white">{language === 'id' ? 'Menu Makanan & Minuman' : 'Food & Beverages Menu'}</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">{language === 'id' ? '1 Meja, 1 QR. Menggantikan seluruh buku menu kertas yang kotor dan mudah rusak.' : '1 Table, 1 QR. Replaces paper menus cleanly.'}</p>
                </div>
              </div>
            )}

            {activeTabIndustry === 'hotel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{language === 'id' ? 'Untuk Hotel, Villa & Resort' : 'For Hotels, Villas & Resorts'}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    {language === 'id' ? 'Direktori Kamar Bintang 5 & Room Service' : '5-Star Room Directory & Room Dining'}
                  </h3>
                  <p className="mt-3 text-stone-400 text-sm leading-relaxed">
                    {language === 'id'
                      ? 'Gantikan buku direktori hotel tebal di kamar dengan QR modern. Tamu dapat melihat daftar fasilitas (Kolam Renang, Spa, Gym), memesan Room Service makanan ke kamar, terhubung ke WiFi hotel, dan menghubungi resepsionis lewat 1 scan.'
                      : 'Replace bulky room directories with modern QR. Guests view pool/spa/gym schedules, order room service, connect to guest WiFi, and reach reception.'}
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-stone-300">
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Pricelist Room Service & Jam Buka Fasilitas' : 'Room Service Rates & Facility Hours'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Layanan Laundry, Spa, & Rental Kendaraan' : 'Laundry, Spa & Vehicle Rental Booking'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Rating Google Hotel & TripAdvisor booster' : 'Google Hotel & TripAdvisor Rating Booster'}</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-center text-center">
                  <div className="text-4xl mb-3">🏨🛎️</div>
                  <h4 className="text-lg font-bold text-white">{language === 'id' ? 'Direktori Kamar & Layanan' : 'Room Directory & Services'}</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">{language === 'id' ? 'Terpasang elegan di meja nakas kamar hotel, villa, atau suite resort.' : 'Placed elegantly on bedside tables.'}</p>
                </div>
              </div>
            )}

            {activeTabIndustry === 'salon' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{language === 'id' ? 'Untuk Salon & Barbershop' : 'For Salons & Barbershops'}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    {language === 'id' ? 'Price List Treatment & Booking WhatsApp' : 'Treatment Price List & WhatsApp Booking'}
                  </h3>
                  <p className="mt-3 text-stone-400 text-sm leading-relaxed">
                    {language === 'id'
                      ? 'Pelanggan yang sedang menunggu giliran potong rambut atau perawatan bisa scan QR di meja tunggu untuk melihat katalog model rambut, tarif treatment, dan menikmati WiFi gratis tanpa bosan.'
                      : 'Waiting guests scan QR on mirrors or waiting tables to view hairstyle catalogs, treatment prices, and enjoy free WiFi.'}
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-stone-300">
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Daftar Treatment: Haircut, Creambath, Coloring' : 'Treatment List: Haircut, Creambath, Coloring'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Tombol Booking langsung ke WhatsApp kasir' : 'Instant WhatsApp Booking Button'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Review booster untuk rating salon di Google' : 'Google Rating Booster for Hair Salons'}</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-center text-center">
                  <div className="text-4xl mb-3">💇💈</div>
                  <h4 className="text-lg font-bold text-white">{language === 'id' ? 'Price List & Katalog Treatment' : 'Treatment Price List & Catalog'}</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">{language === 'id' ? 'Dipajang di cermin pangkas atau meja resepsionis salon.' : 'Placed on styling mirrors or reception desk.'}</p>
                </div>
              </div>
            )}

            {activeTabIndustry === 'gym' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{language === 'id' ? 'Untuk Gym & Fitness Center' : 'For Gyms & Fitness Centers'}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                    {language === 'id' ? 'Paket Membership & Info Fasilitas' : 'Membership Plans & Class Schedule'}
                  </h3>
                  <p className="mt-3 text-stone-400 text-sm leading-relaxed">
                    {language === 'id'
                      ? 'Calon member gym cukup scan QR di front desk untuk melihat biaya harian/bulanan, jadwal kelas aerobic/yoga, serta paket Personal Trainer dengan transparan.'
                      : 'Prospects scan at front desk to view day-pass/monthly fees, yoga/aerobics classes, and Personal Trainer rates.'}
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-stone-300">
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Paket Visit Harian & Member Bulanan/Tahunan' : 'Daily Visit & Monthly/Yearly Memberships'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'Daftar Layanan Personal Trainer & Suplemen' : 'Personal Trainer Sessions & Supplements'}</li>
                    <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> {language === 'id' ? 'WiFi gratis khusus member gym' : 'Member Free WiFi'}</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-center text-center">
                  <div className="text-4xl mb-3">🏋️🔥</div>
                  <h4 className="text-lg font-bold text-white">{language === 'id' ? 'Paket Member & Jadwal Kelas' : 'Membership Plans & Classes'}</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">{language === 'id' ? 'Dipajang di meja resepsionis front desk gym.' : 'Placed at gym front desk.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. PRICING SECTION */}
      {/* ============================================================== */}
      <section id="harga" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase">{tr.pricing.tag}</h2>
          <p className="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {tr.pricing.title}
          </p>
          <p className="mt-4 text-stone-400 text-base">
            {tr.pricing.desc}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:text-white'
              }`}
            >
              {tr.pricing.monthly}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>{tr.pricing.yearly}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-stone-950/20 text-[10px] font-extrabold">{tr.pricing.saveBadge}</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Card 1: Free Trial */}
          <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{language === 'id' ? 'Uji Coba' : 'Trial'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-[10px] font-bold text-stone-300">14 {language === 'id' ? 'Hari' : 'Days'}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{tr.pricing.card1Title}</h3>
              <p className="text-stone-400 text-xs mt-1">{tr.pricing.card1Subtitle}</p>
              
              <div className="mt-6 pb-6 border-b border-stone-800">
                <span className="text-4xl font-extrabold text-white">{tr.pricing.card1Price}</span>
                <span className="text-xs text-stone-500 ml-1">{tr.pricing.card1Per}</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-stone-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {language === 'id' ? 'Unlimited Meja & Scan' : 'Unlimited Tables & Scans'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {language === 'id' ? 'Akses Menu Digital PWA' : 'Full Interactive PWA Menu'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {language === 'id' ? 'WiFi 1-Tap Auto Connect' : '1-Tap WiFi Auto Connect'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {language === 'id' ? 'Google Review Booster' : 'Google Review Booster'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {language === 'id' ? 'Download Standee Meja QR' : 'Download Print-Ready Standee'}</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-8 w-full py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-white font-bold text-xs active:scale-95 transition-all"
            >
              {tr.pricing.card1Btn}
            </button>
          </div>

          {/* Card 2: Kafe & Resto (Featured) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/15 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-extrabold text-[11px] uppercase tracking-wider shadow-md">
              {tr.pricing.card2Badge}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{language === 'id' ? 'Kafe & UMKM' : 'Cafe & Dining'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-[10px] font-bold text-amber-300 border border-amber-400/20">Pro</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{tr.pricing.card2Title}</h3>
              <p className="text-stone-400 text-xs mt-1">{tr.pricing.card2Subtitle}</p>

              <div className="mt-6 pb-6 border-b border-stone-800">
                <span className="text-4xl font-extrabold text-white">
                  {language === 'id' 
                    ? (billingCycle === 'yearly' ? 'Rp 49.000' : 'Rp 69.000')
                    : (billingCycle === 'yearly' ? '$4 USD' : '$5 USD')}
                </span>
                <span className="text-xs text-stone-500 ml-1">{tr.pricing.perMonth}</span>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-amber-400 mt-1 font-semibold">{tr.pricing.card2YearlyNote}</p>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-xs text-stone-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> <strong>{language === 'id' ? 'Semua Fitur Trial Tanpa Batas' : 'All Free Trial Features Unlocked'}</strong></li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> <strong>{language === 'id' ? 'Unlimited Meja di 1 Lokasi/Outlet' : 'Unlimited Tables at 1 Location'}</strong></li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {language === 'id' ? 'Menu Video & Foto Kategori Tanpa Kuota' : 'Unlimited Photo & Video Menus'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {language === 'id' ? 'Download Standee Meja Tanpa Watermark' : 'Standee Templates Without Watermark'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {language === 'id' ? 'Dukungan CS Prioritas WhatsApp' : 'Priority WhatsApp Support'}</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              {tr.pricing.card2Btn}
            </button>
          </div>

          {/* Card 3: Hotel & Hospitality */}
          <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{language === 'id' ? 'Hospitality' : 'Hotel & Resort'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-400/10 text-[10px] font-bold text-sky-300 border border-sky-400/20">Business</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-3">{tr.pricing.card3Title}</h3>
              <p className="text-stone-400 text-xs mt-1">{tr.pricing.card3Subtitle}</p>

              <div className="mt-6 pb-6 border-b border-stone-800">
                <span className="text-4xl font-extrabold text-white">
                  {language === 'id'
                    ? (billingCycle === 'yearly' ? 'Rp 119.000' : 'Rp 149.000')
                    : (billingCycle === 'yearly' ? '$9 USD' : '$12 USD')}
                </span>
                <span className="text-xs text-stone-500 ml-1">{tr.pricing.perMonth}</span>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-sky-400 mt-1 font-semibold">{tr.pricing.card3YearlyNote}</p>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-xs text-stone-300">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> <strong>{language === 'id' ? 'Semua Fitur Paket Pro' : 'All Pro Features Included'}</strong></li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> <strong>{language === 'id' ? 'Unlimited Kamar / Villa Room' : 'Unlimited Rooms & Villas'}</strong></li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> {language === 'id' ? 'Direktori Fasilitas & Jam Operasional' : 'Facility Directory & Operating Hours'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> {language === 'id' ? 'Katalog Room Service & Laundry Booking' : 'Room Service & Laundry Ordering'}</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> {language === 'id' ? 'Multiple WiFi (Tamu & Staff terpisah)' : 'Multiple WiFi (Guest & Staff)'}</li>
              </ul>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-8 w-full py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-white font-bold text-xs active:scale-95 transition-all"
            >
              {tr.pricing.card3Btn}
            </button>
          </div>
        </div>

        {/* Accepted Payments Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">{tr.pricing.secureBarTitle}</p>
              <p className="text-xs text-stone-400">{tr.pricing.secureBarDesc}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200">
              QRIS: SEHAT PRO, DIGITAL & KREATIF (ID1025418493371)
            </span>
            <span className="px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200">
              PayPal: paypal.me/harwinariyanto1 (rwinjember@gmail.com)
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FAQ ACCORDION */}
      {/* ============================================================== */}
      <section id="faq" className="relative z-10 py-20 bg-stone-900/40 border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase">{tr.nav.faq}</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
              {language === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions'}
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-stone-400 leading-relaxed border-t border-stone-800/60 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. BOTTOM CTA */}
      {/* ============================================================== */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-[40px] bg-gradient-to-b from-amber-500/20 via-stone-900 to-stone-950 border border-amber-500/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {tr.bottomCta.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto">
              {tr.bottomCta.desc}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
              >
                {tr.bottomCta.btnTrial}
              </button>
              <a
                href="https://wa.me/6285854203343?text=Halo%20Admin%20SmartQR%2C%20saya%20mau%20konsultasi%20untuk%20kafe%2Fhotel%20saya"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 font-bold text-sm hover:border-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{tr.bottomCta.btnWa}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. FOOTER */}
      {/* ============================================================== */}
      <footer className="relative z-10 border-t border-stone-900 bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base text-white">SmartQR PWA Platform</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
            <a href="#fitur" className="hover:text-amber-400">{tr.nav.features}</a>
            <a href="#harga" className="hover:text-amber-400">{tr.nav.pricing}</a>
            <a href="#faq" className="hover:text-amber-400">{tr.nav.faq}</a>
            <Link to="/admin/login" className="hover:text-amber-400">{language === 'id' ? 'Login Bisnis' : 'Business Login'}</Link>
            <Link to="/super/login" className="hover:text-amber-400 text-stone-600">Super Admin</Link>
          </div>

          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} SmartQR. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 10. MODAL PENDAFTARAN MANDIRI (SELF-REGISTRATION) */}
      {/* ============================================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            {/* Close Button */}
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-xl font-extrabold text-white">{tr.modal.title}</h3>
            </div>
            <p className="text-xs text-stone-400 mb-6">
              {tr.modal.desc}
            </p>

            {regError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nama Bisnis */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  {tr.modal.nameLabel} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={tr.modal.namePlaceholder}
                  value={bizName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  {tr.modal.slugLabel} <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 overflow-hidden focus-within:border-amber-500 transition-colors">
                  <span className="px-3 text-xs text-stone-500 font-mono select-none">/q/</span>
                  <input
                    type="text"
                    required
                    placeholder="kopi-senja"
                    value={bizSlug}
                    onChange={(e) => setBizSlug(slugify(e.target.value))}
                    className="w-full py-3 pr-4 bg-transparent text-white text-sm focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  {tr.modal.slugTip}
                </p>
              </div>

              {/* Tipe Bisnis */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  {tr.modal.typeLabel} <span className="text-amber-400">*</span>
                </label>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value as BusinessType)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="cafe">☕ {language === 'id' ? 'Kafe / Coffee Shop' : 'Cafe / Coffee Shop'}</option>
                  <option value="restaurant">🍽️ {language === 'id' ? 'Restoran / Rumah Makan' : 'Restaurant / Dining'}</option>
                  <option value="hotel">🏨 {language === 'id' ? 'Hotel / Penginapan' : 'Hotel / Lodging'}</option>
                  <option value="villa">🏡 {language === 'id' ? 'Villa / Homestay' : 'Villa / Homestay'}</option>
                  <option value="bar">🍸 {language === 'id' ? 'Bar / Lounge' : 'Bar / Lounge'}</option>
                  <option value="salon">💇 {language === 'id' ? 'Salon Kecantikan' : 'Beauty Salon'}</option>
                  <option value="barbershop">💈 {language === 'id' ? 'Barbershop' : 'Barbershop'}</option>
                  <option value="gym">🏋️ {language === 'id' ? 'Gym & Fitness Center' : 'Gym & Fitness Center'}</option>
                  <option value="other">📋 {language === 'id' ? 'Usaha Lainnya' : 'Other Businesses'}</option>
                </select>
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  {tr.modal.waLabel}
                </label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Buat PIN 6 Digit */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>{tr.modal.pinLabel} <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] text-stone-500 font-normal">{tr.modal.pinSub}</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={bizPin}
                    onChange={(e) => setBizPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-sm tracking-widest font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-stone-500 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isRegistering}
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>{tr.modal.btnLoading}</span>
                  </>
                ) : (
                  <>
                    <span>{tr.modal.btnSubmit}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
