import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useBusiness } from '../../providers/BusinessProvider'
import { getPublicMenuUrl } from '../../lib/url/generator'

export default function AdminQrPrintPage() {
  const { selectedBusiness } = useBusiness()
  const url = useMemo(() => selectedBusiness ? getPublicMenuUrl(selectedBusiness.slug) : '', [selectedBusiness])

  if (!selectedBusiness) return null

  const print = () => window.print()

  return (
    <main className="min-h-screen bg-surface text-stone-900 pb-24 lg:pb-6">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/qr" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 hover:bg-stone-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </a>
            <div>
              <div className="text-[10px] uppercase tracking-[.16em] text-stone-400 font-semibold">Print Studio</div>
              <div className="font-extrabold text-sm">Kartu QR</div>
            </div>
          </div>
          <button onClick={print} className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-4 text-xs font-bold text-white shadow-lg shadow-primary-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>


      <div className="mx-auto max-w-xl px-4 pb-6 pt-4">
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-xs text-stone-600 leading-relaxed">
          Preview ukuran kartu <strong>A6</strong> (105 × 148 mm). Saat dicetak, area di bawah akan menjadi satu kartu QR bersih.
        </div>
      </div>

      {/* A6 Card */}
      <section className="mx-auto w-[105mm] min-h-[148mm] rounded-[12mm] bg-white p-[10mm] shadow-[0_18px_60px_rgba(0,0,0,.12)] flex flex-col items-center justify-between text-center">
        <div className="mt-4">
          {selectedBusiness.logo_url
            ? <img src={selectedBusiness.logo_url} alt="" className="mx-auto h-14 w-14 rounded-2xl object-cover" />
            : <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white text-lg font-black">QR</div>}
          <h1 className="mt-4 text-lg font-extrabold tracking-tight text-stone-900">{selectedBusiness.name}</h1>
          <p className="mt-1 text-xs text-stone-400">Menu Digital</p>
        </div>

        <div className="rounded-3xl border border-stone-100 bg-stone-50 p-4">
          <QRCodeSVG value={url} size={235} level="H" includeMargin />
        </div>

        <div className="mb-2">
          <div className="text-base font-extrabold text-stone-900">Scan untuk buka Menu</div>
          <p className="mt-1 text-[10px] leading-5 text-stone-400">Arahkan kamera smartphone ke QR code di atas</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100">
            <span className="text-[9px] font-bold text-primary">Powered by SmartQR</span>
          </div>
        </div>
      </section>

      {/* Bottom action buttons */}
      <div className="no-print mx-auto flex max-w-xl gap-3 px-4 py-5">
        <button onClick={print} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-sm font-bold text-white shadow-lg shadow-primary-200 active:scale-[0.98] transition-all">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Cetak
        </button>
        <button onClick={() => window.print()} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-stone-700 shadow-[0_4px_16px_rgba(0,0,0,.05)] active:scale-[0.98] transition-all">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Simpan PDF
        </button>
      </div>

      <style>{`
        @media print {
          @page { size: A6 portrait; margin: 0; }
          html, body { background: #fff !important; margin: 0 !important; }
          .no-print { display: none !important; }
          main { min-height: auto !important; padding: 0 !important; }
          section { margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </main>
  )
}
