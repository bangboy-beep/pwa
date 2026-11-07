import { ArrowLeft, Shield, Lock, FileText, Eye, Database, Server, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

export default function PrivacyPolicyPage() {
  const { language } = useLanguage()

  const isId = language === 'id'

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isId ? 'Kembali ke Beranda' : 'Back to Home'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/terms"
              className="text-xs font-medium text-stone-400 hover:text-white transition-colors"
            >
              {isId ? 'Ketentuan Layanan' : 'Terms of Service'}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-stone-900 bg-gradient-to-b from-stone-900/60 to-stone-950 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>{isId ? 'Kepatuhan UU Pelindungan Data Pribadi (UU PDP)' : 'Privacy & Data Protection Compliance'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
          </h1>
          <p className="mt-3 text-stone-400 text-sm sm:text-base leading-relaxed">
            {isId
              ? 'Terakhir diperbarui: November 2026. Dokumen ini menjelaskan bagaimana SmartQR ("kami") mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan platform PWA QR kami.'
              : 'Last updated: November 2026. This document explains how SmartQR ("we", "us", or "our") collects, uses, stores, and protects your personal information when using our PWA QR platform.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm leading-relaxed text-stone-300">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{isId ? '1. Pendahuluan' : '1. Introduction'}</span>
          </h2>
          <p>
            {isId
              ? 'SmartQR berkomitmen penuh untuk menjaga privasi dan keamanan data pengguna platform kami, baik pengelola bisnis (Tenant/Merchant) maupun pengunjung yang mengakses menu/layanan melalui pemindaian QR code. Kebijakan ini disusun dengan merujuk pada regulasi perlindungan data yang berlaku di Indonesia, termasuk Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).'
              : 'SmartQR is fully committed to safeguarding the privacy and security of users of our platform, including business owners (Tenants/Merchants) and end-customers scanning QR codes for menus or services. This policy complies with applicable data protection regulations, including Indonesian Law No. 27 of 2022 on Personal Data Protection (UU PDP).'}
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span>{isId ? '2. Data yang Kami Kumpulkan' : '2. Information We Collect'}</span>
          </h2>
          <p>
            {isId
              ? 'Kami hanya mengumpulkan informasi yang diperlukan untuk memastikan layanan SmartQR dapat berjalan secara optimal:'
              : 'We only collect data strictly necessary to deliver optimal functionality on SmartQR:'}
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-stone-400">
            <li>
              <strong className="text-stone-200">{isId ? 'Data Pemilik Bisnis (Tenant):' : 'Business Owner Data (Tenants):'}</strong>{' '}
              {isId
                ? 'Nama bisnis, slug URL, kategori usaha (resto, kafe, gym, hotel, dsb.), nomor kontak/WhatsApp operasional, dan PIN otentikasi login admin.'
                : 'Business name, custom URL slug, business category, operational WhatsApp/contact number, and administrative PIN credentials.'}
            </li>
            <li>
              <strong className="text-stone-200">{isId ? 'Data Pengunjung / Pelanggan:' : 'Visitor / Customer Data:'}</strong>{' '}
              {isId
                ? 'Informasi nomor meja/kamar saat memesan, rincian pesanan yang dipilih, serta ulasan (review) atau feedback yang dikirimkan secara sukarela.'
                : 'Table or room identification numbers upon ordering, selected menu cart items, and any voluntary reviews or feedback submitted.'}
            </li>
            <li>
              <strong className="text-stone-200">{isId ? 'Data Teknis & PWA:' : 'Technical & PWA Data:'}</strong>{' '}
              {isId
                ? 'Data cache browser, preferensi bahasa (ID/EN), log akses jaringan, dan status instalasi aplikasi Progressive Web App (PWA).'
                : 'Browser cache states, chosen language preferences (ID/EN), network access logs, and Progressive Web App installation status.'}
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{isId ? '3. Tujuan Penggunaan Informasi' : '3. How We Use Your Data'}</span>
          </h2>
          <p>
            {isId
              ? 'Informasi yang dikumpulkan digunakan semata-mata untuk tujuan operasional dan penyempurnaan layanan:'
              : 'Collected data is utilized strictly for service delivery, operations, and platform enhancements:'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-400">
            <li>{isId ? 'Menampilkan katalog menu, info WiFi, dan profil bisnis yang tepat kepada pelanggan.' : 'Serving menu catalogs, WiFi configurations, and business profiles to customers.'}</li>
            <li>{isId ? 'Meneruskan pesanan pelanggan secara langsung ke WhatsApp atau dashboard kasir bisnis.' : 'Routing customer orders directly to the business’s WhatsApp or management dashboard.'}</li>
            <li>{isId ? 'Melakukan autentikasi dan memvalidasi hak akses pemilik bisnis ke dashboard admin.' : 'Authenticating and validating business administrator access to the management console.'}</li>
            <li>{isId ? 'Menghasilkan kode QR dan materi cetak akrilik yang valid sesuai slug bisnis.' : 'Generating valid QR codes and print-ready standee designs corresponding to the business slug.'}</li>
            <li>{isId ? 'Mencegah upaya kecurangan, penyalahgunaan, spam, atau ancaman siber pada sistem.' : 'Preventing fraudulent activity, abusive spam, or cyber threats against our infrastructure.'}</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>{isId ? '4. Keamanan & Penyimpanan Data' : '4. Data Storage & Security'}</span>
          </h2>
          <p>
            {isId
              ? 'Kami menerapkan standar keamanan teknis dan organisasional modern untuk menjaga data Anda tetap aman:'
              : 'We employ modern technical and organizational safeguards to ensure data integrity:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <h3 className="font-semibold text-white mb-1">{isId ? 'Enkripsi & Proteksi' : 'Encryption & Protection'}</h3>
              <p className="text-xs text-stone-400">
                {isId
                  ? 'Semua lalu lintas data dienkripsi menggunakan protokol HTTPS/TLS modern. Kredensial PIN disimpan dengan enkripsi satu arah.'
                  : 'All traffic is encrypted in transit via modern HTTPS/TLS protocols. Access PINs are hashed and securely stored.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <h3 className="font-semibold text-white mb-1">{isId ? 'Infrastruktur Cloud Tepercaya' : 'Trusted Cloud Infrastructure'}</h3>
              <p className="text-xs text-stone-400">
                {isId
                  ? 'Basis data kami di-host pada infrastruktur bersertifikat ISO/IEC 27001 dan SOC 2 dengan Row-Level Security (RLS) aktif.'
                  : 'Databases are hosted on ISO/IEC 27001 and SOC 2 certified infrastructure with strict Row-Level Security (RLS).'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>{isId ? '5. Kebijakan Berbagi Data Pihak Ketiga' : '5. Third-Party Data Sharing'}</span>
          </h2>
          <p>
            <strong className="text-amber-400">
              {isId ? 'SmartQR TIDAK PERNAH dan TIDAK AKAN menjual data pribadi Anda kepada pihak ketiga atau pengiklan.' : 'SmartQR NEVER sells and WILL NOT sell your personal data to any third-party brokers or advertisers.'}
            </strong>
          </p>
          <p>
            {isId
              ? 'Data hanya dapat diteruskan kepada penyedia infrastruktur pihak ketiga (misalnya penyedia hosting cloud, payment gateway terakreditasi saat pembayaran online diaktifkan) semata-mata untuk memproses transaksi yang Anda minta.'
              : 'Data is only transmitted to vetted third-party service providers (such as cloud hosting and accredited payment gateways for online transactions) solely to fulfill requests initiated by you.'}
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>{isId ? '6. Hak Pemilik Data Pribadi' : '6. Your Data Rights'}</span>
          </h2>
          <p>
            {isId
              ? 'Sesuai UU PDP Indonesia, Anda berhak untuk:'
              : 'In accordance with privacy standards and applicable laws, you hold the right to:'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-400">
            <li>{isId ? 'Mengakses dan meminta salinan data akun bisnis Anda.' : 'Access and request a copy of your registered business profile.'}</li>
            <li>{isId ? 'Memperbarui atau memperbaiki data yang tidak akurat melalui dashboard admin.' : 'Update or rectify inaccurate business data via the admin dashboard.'}</li>
            <li>{isId ? 'Meminta penghapusan permanen akun dan seluruh riwayat menu/pesanan bisnis Anda.' : 'Request complete deletion and erasure of your business account and related data.'}</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <h2 className="text-base font-bold text-white">{isId ? 'Hubungi Tim Privasi Kami' : 'Contact Our Privacy Team'}</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isId
              ? 'Jika Anda memiliki pertanyaan, keberatan, atau ingin meminta penghapusan data, silakan hubungi tim kami via WhatsApp resmi di '
              : 'If you have any questions, concerns, or data erasure requests, please contact our team via official WhatsApp at '}
            <a
              href="https://wa.me/6285854203343"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-bold hover:underline"
            >
              +62 858-5420-3343
            </a>
            {isId ? ' atau melalui kanal dukungan SmartQR.' : ' or through SmartQR support channels.'}
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-8 px-4 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} SmartQR PWA Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

