import { useState } from 'react'
import { Lock, ArrowRight, QrCode, AlertCircle, CheckCircle2, KeyRound, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageToggle } from '../../components/ui/LanguageToggle'

const CURRENT_YEAR = new Date().getFullYear()

export default function AdminLoginPage() {
  const [slug, setSlug] = useState('')
  const [pin, setPin] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const { t } = useLanguage()

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!rawSlug) {
      setMessage({ type: 'error', text: t('adminLogin', 'enterSlug') })
      return
    }
    if (pin.length < 4) {
      setMessage({ type: 'error', text: t('adminLogin', 'enterPinMin') })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // 1. Fuzzy-lookup bisnis: cocokkan slug meski user lupa tanda hubung
      //    RPC lookup_business_for_login bisa diakses anon dan normalisasi slug otomatis
      let bizData: { business_id: string; slug: string; name?: string } | null = null
      let suggestionSlug: string | null = null

      const { data: lookupRows, error: lookupErr } = await (supabase as any).rpc(
        'lookup_business_for_login',
        { p_input: rawSlug }
      )

      if (!lookupErr && lookupRows && lookupRows.length > 0) {
        bizData = lookupRows[0]
      }

      // Fallback 1b: Jika tidak ketemu via RPC (misal perbedaan huruf s vs z, atau typo minor),
      // cari di tabel businesses langsung
      if (!bizData) {
        const { data: allBiz } = await supabase
          .from('businesses')
          .select('id, name, slug, status')

        const bizList = (allBiz || []) as Array<{ id: string; name: string; slug: string; status: string }>

        if (bizList.length > 0) {
          const normInput = rawSlug.replace(/-/g, '')
          const normInputSZ = normInput.replace(/z/g, 's')

          // Cari kecocokan variasi s/z atau nama bisnis
          const exactFuzzy = bizList.find(b => {
            const bNorm = (b.slug || '').replace(/-/g, '')
            const bNormSZ = bNorm.replace(/z/g, 's')
            const bNameNorm = (b.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/z/g, 's')
            return bNormSZ === normInputSZ || bNameNorm === normInputSZ
          })

          if (exactFuzzy) {
            bizData = {
              business_id: exactFuzzy.id,
              slug: exactFuzzy.slug,
              name: exactFuzzy.name
            }
          } else {
            // Cek apakah ada bisnis yang mirip untuk diberikan saran
            const closeBiz = bizList.find(b => {
              const bNorm = (b.slug || '').replace(/-/g, '')
              return bNorm.includes(normInput) || normInput.includes(bNorm)
            })
            if (closeBiz) {
              suggestionSlug = closeBiz.slug
            }
          }
        }
      }

      if (!bizData) {
        if (suggestionSlug) {
          throw new Error(`Bisnis "${rawSlug}" tidak ditemukan. Apakah maksud Anda: "${suggestionSlug}"?`)
        }
        throw new Error(`Bisnis "${rawSlug}" tidak ditemukan. Pastikan slug sudah benar.`)
      }

      // Gunakan slug CANONICAL dari DB (bukan dari input user), agar email login tepat
      const canonicalSlug = bizData.slug as string
      const pinValue = pin.trim()
      const loginEmail = `${canonicalSlug}@smartqr.app`

      // 2. Coba login langsung
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: pinValue,
      })

      if (signInErr) {
        // 3. Fallback: sync auth via verify_business_pin (creates auth.users + identities jika belum ada)
        const { data: pinOk, error: rpcErr } = await (supabase as any).rpc('verify_business_pin', {
          p_slug: canonicalSlug,
          p_pin: pinValue,
        })

        if (rpcErr || !pinOk) {
          throw new Error(t('adminLogin', 'invalidPin'))
        }

        // 4. Retry setelah sinkronisasi
        const { error: retryErr } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: pinValue,
        })
        if (retryErr) {
          throw new Error(t('adminLogin', 'invalidPin'))
        }
      } else {
        // Sinkronisasi membership di background
        try {
          await (supabase as any).rpc('verify_business_pin', {
            p_slug: canonicalSlug,
            p_pin: pinValue,
          })
        } catch {
          // aman, akan di-handle oleh getMyBusinesses
        }
      }

      if (rememberMe) {
        localStorage.setItem(`smartqr_pin_${canonicalSlug}`, pinValue)
      }

      sessionStorage.setItem('smartqr_selected_business_id', bizData.business_id)
      window.location.href = '/admin'
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : t('common', 'systemError')
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-primary flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center px-6 pt-10 pb-14 text-center overflow-hidden">
        {/* Language selector in top right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageToggle variant="button" className="bg-white/90 shadow-md" />
        </div>

        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-24 -left-20 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative w-16 h-16 rounded-[22px] bg-white flex items-center justify-center shadow-xl shadow-primary-900/30">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h1 className="relative mt-4 text-2xl font-extrabold text-white tracking-tight">{t('adminLogin', 'heroTitle')}</h1>
        <p className="relative mt-1 text-sm text-white/80 font-medium text-balance">
          {t('adminLogin', 'heroSubtitle')}
        </p>
      </section>

      {/* Sheet */}
      <section className="relative -mt-8 bg-white rounded-t-[32px] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(36,28,115,0.18)] sm:mx-auto sm:w-full sm:max-w-md sm:mb-10 sm:rounded-[32px] animate-sheet-up">
        <div className="w-10 h-1 rounded-full bg-outline mx-auto mb-5" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight">{t('adminLogin', 'pinLoginTitle')}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{t('adminLogin', 'pinLoginSubtitle')}</p>
          </div>
        </div>

        <form onSubmit={submitPin} className="space-y-4">
          <div className="relative">
            <Building2 className="absolute left-4 top-[38px] w-5 h-5 text-ink-muted pointer-events-none z-10" aria-hidden="true" />
            <Input
              label={t('adminLogin', 'slugLabel')}
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder={t('adminLogin', 'slugPlaceholder')}
              className="pl-12"
              helperText={t('adminLogin', 'slugHelper')}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-[38px] w-5 h-5 text-ink-muted pointer-events-none z-10" aria-hidden="true" />
            <Input
              label={t('adminLogin', 'pinLabel')}
              type="password"
              required
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('adminLogin', 'pinPlaceholder')}
              className="pl-12"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md text-primary accent-primary cursor-pointer"
            />
            {t('adminLogin', 'rememberMe')}
          </label>

          {message && (
            <div
              role="alert"
              className={`flex items-start gap-2.5 rounded-2xl p-3 text-sm font-medium ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <Button type="submit" size="lg" isLoading={loading} className="w-full">
            {loading ? t('common', 'processing') : t('adminLogin', 'enterDashboard')}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-outline text-center space-y-2">
          <p className="text-xs text-ink-muted">
            {t('adminLogin', 'superAdminText')}{' '}
            <a href="/super/login" className="text-primary font-semibold hover:underline">
              {t('adminLogin', 'superAdminLink')}
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-ink-muted">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          {'© '}
          {CURRENT_YEAR} SmartQR
        </p>
      </section>
    </main>
  )
}
