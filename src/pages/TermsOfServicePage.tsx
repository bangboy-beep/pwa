import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

export default function TermsOfServicePage() {
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
              to="/privacy"
              className="text-xs font-medium text-stone-400 hover:text-white transition-colors"
            >
              {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-stone-900 bg-gradient-to-b from-stone-900/60 to-stone-950 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>{isId ? 'Perjanjian Penggunaan Layanan' : 'Terms of Service Agreement'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isId ? 'Ketentuan Layanan' : 'Terms of Service'}
          </h1>
          <p className="mt-3 text-stone-400 text-sm sm:text-base leading-relaxed">
            {isId
              ? 'Terakhir diperbarui: November 2026. Harap baca syarat dan ketentuan ini dengan cermat sebelum mendaftarkan bisnis Anda atau menggunakan platform SmartQR.'
              : 'Last updated: November 2026. Please read these terms and conditions carefully before registering your business or using the SmartQR platform.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm leading-relaxed text-stone-300">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{isId ? '1. Penerimaan Ketentuan' : '1. Acceptance of Terms'}</span>
          </h2>
          <p>
            {isId
              ? 'Dengan mendaftar, mengakses, atau menggunakan platform SmartQR (termasuk fitur katalog menu QR, portal WiFi, pemesanan, dan ulasan), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda tidak diperkenankan menggunakan platform kami.'
              : 'By registering, accessing, or using the SmartQR platform (including QR menu catalogs, WiFi portals, ordering, and customer review modules), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you disagree with any portion of these terms, you must not use our platform.'}
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isId ? '2. Deskripsi Layanan' : '2. Description of Service'}</span>
          </h2>
          <p>
            {isId
              ? 'SmartQR adalah platform perangkat lunak (Software-as-a-Service) berbasis Progressive Web App (PWA) yang memfasilitasi bisnis (kafe, restoran, hotel, gym, salon, dan unit usaha lainnya) untuk membuat katalog digital, kode QR siap cetak, sistem penerimaan pesanan, dan pusat informasi pelanggan secara mandiri.'
              : 'SmartQR provides a multi-tenant Progressive Web App (PWA) software platform enabling businesses (cafes, restaurants, hotels, gyms, salons, etc.) to self-manage digital catalogs, print-ready QR standees, ordering pathways, and customer hub modules.'}
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>{isId ? '3. Akun Bisnis & Keamanan PIN' : '3. Business Accounts & PIN Security'}</span>
          </h2>
          <p>
            {isId
              ? 'Pemilik bisnis bertanggung jawab penuh untuk:'
              : 'Business owners are solely responsible for:'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-400">
            <li>{isId ? 'Memberikan informasi bisnis dan nomor kontak WhatsApp yang sah serta akurat.' : 'Providing true, accurate, and lawful business information and contact numbers.'}</li>
            <li>{isId ? 'Menjaga kerahasiaan PIN akses admin bisnis Anda dan tidak membagikannya kepada pihak yang tidak berwenang.' : 'Maintaining the confidentiality of your administrative access PIN and not sharing it with unauthorized parties.'}</li>
            <li>{isId ? 'Semua aktivitas dan transaksi yang terjadi di bawah akun slug bisnis Anda menjadi tanggung jawab pemilik akun.' : 'All activities and updates occurring under your designated business slug.'}</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{isId ? '4. Batasan Tanggung Jawab Operasional Tenant' : '4. Tenant Operational Responsibility & Disclaimers'}</span>
          </h2>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-300 space-y-2">
            <p>
              {isId
                ? 'SmartQR adalah penyedia teknologi perangkat lunak independen. SmartQR BUKAN penjual makanan, minuman, barang, atau jasa yang terdaftar pada menu merchant.'
                : 'SmartQR acts strictly as an independent software provider. SmartQR is NOT the seller, preparer, or vendor of any foods, beverages, goods, or services listed by merchants.'}
            </p>
            <p className="text-xs text-stone-400">
              {isId
                ? 'Segala hal yang berkaitan dengan harga, ketersediaan stok, kehalalan, kebersihan, rasa, alergen, cedera pada fasilitas gym/hotel, maupun perselisihan antara pengelola bisnis dan pelanggan akhir merupakan tanggung jawab mutlak pemilik bisnis (Tenant). SmartQR dibebaskan dari segala tuntutan hukum yang timbul akibat transaksi langsung tersebut.'
                : 'Merchants bear total liability for menu pricing, product hygiene, ingredients, allergens, facility safety, and disputes with end-customers. SmartQR is held completely harmless from claims arising from direct merchant-customer transactions.'}
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{isId ? '5. Biaya Berlangganan & Uji Coba Gratis' : '5. Subscriptions & Free Trial'}</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2 text-stone-400">
            <li>
              <strong className="text-stone-200">{isId ? 'Uji Coba Gratis (Free Trial):' : 'Free Trial Period:'}</strong>{' '}
              {isId
                ? 'Setiap pendaftaran baru mendapatkan masa uji coba gratis selama 14 hari dengan akses fitur lengkap tanpa perlu memasukkan kartu kredit.'
                : 'New accounts receive a 14-day free trial with full feature access without requiring a credit card upfront.'}
            </li>
            <li>
              <strong className="text-stone-200">{isId ? 'Tarif Flat per Outlet:' : 'Flat Pricing per Outlet:'}</strong>{' '}
              {isId
                ? 'Biaya langganan dihitung flat per outlet bisnis tanpa batasan jumlah meja atau scan QR.'
                : 'Subscription fees are billed at a flat rate per physical outlet, without per-table scan surcharges.'}
            </li>
            <li>
              <strong className="text-stone-200">{isId ? 'Kebijakan Pengembalian Dana:' : 'Refund Policy:'}</strong>{' '}
              {isId
                ? 'Pembayaran paket langganan yang telah diproses bersifat final dan tidak dapat di-refund, kecuali ditentukan lain oleh undang-undang atau perjanjian khusus tertulis.'
                : 'Processed subscription payments are non-refundable once active, unless mandated otherwise by applicable statutory provisions.'}
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{isId ? '6. Larangan Penggunaan (Prohibited Activities)' : '6. Prohibited Uses'}</span>
          </h2>
          <p>
            {isId
              ? 'Pengguna dilarang keras menggunakan SmartQR untuk:'
              : 'You are strictly prohibited from using SmartQR to:'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-400">
            <li>{isId ? 'Menjual barang terlarang, narkotika, obat-obatan ilegal, senjata, atau materi pornografi.' : 'Promote or sell narcotics, illicit substances, weapons, or adult/pornographic content.'}</li>
            <li>{isId ? 'Melakukan tindakan penipuan (fraud), phishing, skema ponzi, atau pelanggaran hak cipta pihak ketiga.' : 'Engage in fraudulent schemes, phishing, Ponzi models, or third-party trademark infringements.'}</li>
            <li>{isId ? 'Mencoba merusak, melakukan reverse-engineering, atau melancarkan serangan siber (DDoS, injection) ke server SmartQR.' : 'Attempting reverse-engineering, vulnerability exploits, or cyber attacks (DDoS, injections) on SmartQR.'}</li>
          </ul>
          <p className="text-xs text-amber-400">
            {isId
              ? 'SmartQR berhak membekukan atau menghapus akun yang melanggar ketentuan di atas secara sepihak tanpa pemberitahuan sebelumnya.'
              : 'SmartQR reserves the right to immediately suspend or terminate accounts that breach these provisions without prior notice.'}
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{isId ? '7. Ketersediaan Layanan & Batasan Tanggung Jawab' : '7. Service Availability & Limitation of Liability'}</span>
          </h2>
          <p>
            {isId
              ? 'Layanan SmartQR disediakan "sebagaimana adanya" (as is) dan "sebagaimana tersedia" (as available). Kami terus berupaya menjaga uptime optimal, namun kami tidak bertanggung jawab atas kerugian finansial atau kehilangan peluang bisnis yang diakibatkan oleh pemadaman internet lokal merchant, gangguan server hosting global, atau kejadian kahar (force majeure).'
              : 'SmartQR is provided on an "as-is" and "as-available" basis. While we strive for maximum uptime, we shall not be liable for indirect, incidental, or consequential damages resulting from local merchant connectivity loss, cloud provider downtime, or force majeure events.'}
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{isId ? '8. Hukum yang Berlaku' : '8. Governing Law'}</span>
          </h2>
          <p>
            {isId
              ? 'Ketentuan Layanan ini diatur dan ditafsirkan sesuai dengan hukum Negara Republik Indonesia. Segala perselisihan yang timbul akan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat.'
              : 'These Terms of Service are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes shall first be resolved through good-faith amicable settlement.'}
          </p>
        </section>

        {/* Support Section */}
        <section className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <h2 className="text-base font-bold text-white">{isId ? 'Pertanyaan Terkait Ketentuan Layanan?' : 'Questions About Our Terms?'}</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isId
              ? 'Tim SmartQR siap membantu Anda. Silakan hubungi kami via WhatsApp resmi di '
              : 'Our team is here to assist you. Contact us via official WhatsApp at '}
            <a
              href="https://wa.me/6285854203343"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-bold hover:underline"
            >
              +62 858-5420-3343
            </a>
            {isId ? ' untuk konsultasi atau pertanyaan lebih lanjut.' : ' for further inquiries.'}
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
