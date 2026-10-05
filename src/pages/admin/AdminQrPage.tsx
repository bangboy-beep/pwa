import { useMemo, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { useBusiness } from '../../providers/BusinessProvider'
import { getPublicCustomerHubUrl } from '../../lib/url/generator'
import { toast } from '../../components/ui/Toast'

export default function AdminQrPage() {
  const { selectedBusiness } = useBusiness()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const url = useMemo(
    () => selectedBusiness ? getPublicCustomerHubUrl(selectedBusiness.slug) : '',
    [selectedBusiness]
  )

  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link berhasil disalin')
    setTimeout(() => setCopied(false), 1600)
  }

  const download = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `smartqr-${selectedBusiness?.slug || 'business'}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  if (!selectedBusiness) return null

  return (
    <div className="w-full space-y-5 pb-4">
      {/* QR Card */}
      <section className="w-full rounded-2xl bg-white p-6 shadow-sm border border-stone-200 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#f0883a] mb-5 tracking-wider uppercase">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h3v3h-3v-3zm-2 2h7v7h-7v-7zm2 2v3h3v-3h-3z" />
          </svg>
          QR Customer Hub
        </div>
        <h2 className="text-[18px] font-bold text-stone-900 mb-1">{selectedBusiness.name}</h2>
        <p className="text-xs text-stone-500 mb-6 font-medium">Scan untuk akses Customer Hub</p>

        <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-stone-50 border border-stone-200 mb-5 shadow-inner">
          <QRCodeSVG value={url} size={160} level="H" includeMargin />
        </div>

        <p className="text-xs text-stone-400 mb-2 font-medium">Link Publik Customer Hub:</p>
        <p className="text-[11px] text-stone-500 font-mono break-all px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">{url}</p>
      </section>

      {/* Action buttons */}
      <div ref={canvasRef} className="hidden"><QRCodeCanvas value={url} size={1000} level="H" includeMargin /></div>

      <div className="w-full space-y-3">
        <button onClick={download} className="w-full h-12 rounded-xl bg-[#f0883a] text-white text-[15px] font-bold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download PNG
        </button>
        <button onClick={copy} className="w-full h-12 rounded-xl bg-white text-stone-700 text-[14px] font-bold border border-stone-300 transition-all active:bg-stone-50 flex items-center justify-center gap-2">
          {copied ? <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4 text-[#f0883a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          {copied ? 'URL Tersalin' : 'Copy URL'}
        </button>
      </div>

      {/* Bottom actions */}
      <div className="w-full grid grid-cols-2 gap-3">
        <a href="/admin/qr/print" className="flex items-center justify-center gap-2 rounded-xl bg-white p-3.5 text-[14px] font-bold text-stone-700 border border-stone-300 active:bg-stone-50 transition-all">
          <svg className="h-4 w-4 text-[#f0883a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print QR
        </a>
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-white p-3.5 text-[14px] font-bold text-stone-700 border border-stone-300 active:bg-stone-50 transition-all">
          <svg className="h-4 w-4 text-[#f0883a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview
        </a>
      </div>
    </div>
  )
}