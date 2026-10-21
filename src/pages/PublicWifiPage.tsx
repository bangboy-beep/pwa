// SmartQR Customer WiFi — Mobile Professional Design
// Route: /w/:slug

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createClient } from '../lib/supabase/client'
import { Loading } from '../components/ui/Loading'
import { Wifi, Copy, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { copyToClipboard } from '../lib/utils/clipboard'
import { QRCodeSVG } from 'qrcode.react'
import type { Business, WiFiNetwork } from '../types'
import { useLanguage } from '../i18n/LanguageContext'
import { LanguageToggle } from '../components/ui/LanguageToggle'

export default function PublicWifiPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useLanguage()
  const [business, setBusiness] = useState<Business | null>(null)
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()

  useEffect(() => {
    async function loadData() {
      if (!slug) { setError(t('publicHub', 'invalidSlug')); setLoading(false); return }
      const supabase = createClient()
      try {
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .single()
        if (bizError || !bizData) { setError(t('publicWifi', 'notFoundDesc')); setLoading(false); return }
        setBusiness(bizData as Business)
        const { data: wifiData, error: wifiError } = await supabase
          .from('business_wifi_networks')
          .select('*')
          .eq('business_id', (bizData as Business).id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!wifiError && wifiData) setWifiNetworks(wifiData as WiFiNetwork[])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common', 'error'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [slug, t])

  const handleCopy = async (text: string, id: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopiedId(id)
      showToast('success', t('publicWifi', 'copySuccess', { label }))
      setTimeout(() => setCopiedId(null), 2000)
    } else {
      showToast('error', t('publicWifi', 'copyFailed', { label }))
    }
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
        <div className="bg-white p-8 rounded-[1.25rem] shadow-sm border border-stone-100 max-w-sm w-full text-center relative">
          <div className="absolute top-4 right-4">
            <LanguageToggle variant="button" />
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">{t('publicWifi', 'notFoundTitle')}</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">{error || t('publicWifi', 'notFoundDesc')}</p>
          <Link to={`/q/${slug || ''}`} className="inline-block px-5 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors w-full">
            {t('nav', 'backToHub')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden flex flex-col">

        {/* Back Header with Language Toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <Link to={`/q/${slug}`} className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-all" aria-label={t('common', 'back')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-base font-bold text-stone-900">{t('publicWifi', 'title')}</h1>
          </div>
          <LanguageToggle variant="minimal" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 space-y-6">

          {/* WiFi Icon & Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Wifi className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-stone-900">{t('publicWifi', 'heading', { name: business.name })}</h2>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">{t('publicWifi', 'subheading')}</p>
          </div>

          {/* Network Cards List */}
          {wifiNetworks.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">{t('publicWifi', 'noActiveWifi')}</div>
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
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{wifi.name}</span>
                      <h3 className="text-base font-bold text-stone-900 font-mono mt-0.5">{wifi.ssid}</h3>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center py-2 bg-white rounded-xl border border-stone-100 p-4">
                    <QRCodeSVG value={wifiString} size={150} level="M" />
                    <p className="text-[11px] text-stone-400 mt-2 font-medium">{t('publicWifi', 'scanQrTip')}</p>
                  </div>

                  {/* Details & Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200">
                      <div className="min-w-0 mr-2">
                        <p className="text-[10px] text-stone-400 uppercase font-bold">{t('publicWifi', 'password')}</p>
                        <p className="text-sm font-mono font-bold text-stone-800 tracking-wider">
                          {isShow ? (wifi.password || t('publicWifi', 'noPassword')) : '••••••••'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {wifi.password && (
                          <button
                            type="button"
                            onClick={() => togglePassword(wifi.id)}
                            className="p-2 text-stone-400 hover:text-stone-700 transition-colors"
                            title={isShow ? t('publicWifi', 'hide') : t('publicWifi', 'show')}
                          >
                            {isShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                        {wifi.password && (
                          <button
                            type="button"
                            onClick={() => handleCopy(wifi.password || '', `pass-${wifi.id}`, t('publicWifi', 'password'))}
                            className="p-2 text-stone-400 hover:text-primary transition-colors"
                            title={t('publicWifi', 'copyPassword')}
                          >
                            {isCopiedPass ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(wifi.ssid, `ssid-${wifi.id}`, wifi.name)}
                      className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isCopiedSsid ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {isCopiedSsid ? t('publicWifi', 'ssidCopied') : `${t('publicWifi', 'copySsid')} (${wifi.name})`}
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
            {t('common', 'poweredBy')} <span className="text-stone-400">SmartQR</span>
          </p>
        </div>
      </div>
    </div>
  )
}
