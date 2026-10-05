// SmartQR Customer WiFi — Mobile Professional Design
// Route: /w/:slug

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '../lib/supabase/client'
import { Loading } from '../components/ui/Loading'
import { Wifi, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { QRCodeSVG } from 'qrcode.react'
import type { Business, WiFiNetwork } from '../types'

export default function PublicWifiPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()

  useEffect(() => {
    async function loadData() {
      if (!slug) { setError('Slug bisnis tidak valid'); setLoading(false); return }
      const supabase = createClient()
      try {
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single()
        if (bizError || !bizData) { setError('Bisnis tidak ditemukan'); setLoading(false); return }
        setBusiness(bizData as Business)
        const { data: wifiData, error: wifiError } = await supabase
          .from('business_wifi_networks')
          .select('*')
          .eq('business_id', (bizData as Business).id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!wifiError && wifiData) setWifiNetworks(wifiData as WiFiNetwork[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug])

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    showToast('success', `${label} berhasil disalin!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-5">
        <div className="bg-white p-8 rounded-[1.25rem] shadow-sm border border-stone-100 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">WiFi Tidak Ditemukan</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || 'WiFi belum dikonfigurasi.'}</p>
          <Link to={`/q/${slug || ''}`} className="inline-block px-5 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors w-full">
            Kembali ke Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden flex flex-col">

        {/* Back Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 shrink-0">
          <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-base font-bold text-stone-900">WiFi</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 space-y-6">

          {/* WiFi Icon & Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-50 text-[#f0883a] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Wifi className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-stone-900">Koneksi WiFi {business.name}</h2>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">Pilih jaringan WiFi yang tersedia di area kami</p>
          </div>

          {/* Network Cards List */}
          {wifiNetworks.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">Belum ada WiFi aktif</div>
          ) : (
            wifiNetworks.map((wifi) => {
              const wifiString = `WIFI:T:${wifi.security_type || 'WPA2'};S:${wifi.ssid};P:${wifi.password || ''};;`
              const isShow = showPasswords[wifi.id]
              const isCopiedSsid = copiedId === `ssid-${wifi.id}`
              const isCopiedPass = copiedId === `pass-${wifi.id}`

              return (
                <div key={wifi.id} className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#f0883a] uppercase tracking-wider">{wifi.name}</span>
                      <h3 className="text-base font-bold text-stone-900 font-mono mt-0.5">{wifi.ssid}</h3>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center py-2 bg-white rounded-xl border border-stone-100 p-4">
                    <QRCodeSVG value={wifiString} size={150} level="M" />
                    <p className="text-[11px] text-stone-400 mt-2 font-medium">Scan kamera untuk terhubung</p>
                  </div>

                  {/* Details & Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200">
                      <div className="min-w-0 mr-2">
                        <p className="text-[10px] text-stone-400 uppercase font-bold">Password</p>
                        <p className="text-sm font-mono font-bold text-stone-800 tracking-wider">
                          {isShow ? (wifi.password || 'Tanpa Password') : '••••••••'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {wifi.password && (
                          <button
                            type="button"
                            onClick={() => togglePassword(wifi.id)}
                            className="p-2 text-stone-400 hover:text-stone-700 transition-colors"
                            title={isShow ? 'Sembunyikan' : 'Tampilkan'}
                          >
                            {isShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                        {wifi.password && (
                          <button
                            type="button"
                            onClick={() => handleCopy(wifi.password || '', `pass-${wifi.id}`, 'Password')}
                            className="p-2 text-stone-400 hover:text-[#f0883a] transition-colors"
                            title="Salin Password"
                          >
                            {isCopiedPass ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(wifi.ssid, `ssid-${wifi.id}`, 'Nama SSID')}
                      className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isCopiedSsid ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {isCopiedSsid ? 'SSID Disalin!' : `Salin Nama SSID (${wifi.name})`}
                    </button>
                  </div>
                </div>
              )
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-4 text-center shrink-0 border-t border-stone-100 bg-white">
          <p className="text-[10px] uppercase tracking-widest text-stone-300 font-bold">
            Powered by <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
