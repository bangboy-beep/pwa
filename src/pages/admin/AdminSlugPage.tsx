// SmartQR Admin Slug Access Page
// Route: /admin/:slug
// Direct access to business admin with 6-digit PIN authentication

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowRight,
  AlertCircle,
  Delete,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Lock,
} from 'lucide-react'
import { getBusinessBySlug } from '../../lib/business/service'
import { isSuperAdmin } from '../../lib/config/admin'
import { supabase } from '../../lib/supabase/client'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useBusiness } from '../../providers/BusinessProvider'
import { Loading } from '../../components/ui/Loading'
import { Button } from '../../components/ui/Button'
import { BusinessTypeIcon } from '../../components/ui/BusinessTypeIcon'
import type { Business } from '../../types'

export default function AdminSlugPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuthContext()
  const { setSelectedBusiness, refetch } = useBusiness()

  const [business, setBusiness] = useState<Business | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [businessError, setBusinessError] = useState<string | null>(null)

  // Auth state inspection
  const [isSuper, setIsSuper] = useState(false)
  const [isCurrentOwner, setIsCurrentOwner] = useState(false)
  const [autoLoggingIn, setAutoLoggingIn] = useState(false)

  // PIN Form state
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(true)

  // Fallback for custom email login
  const [useEmailMode, setUseEmailMode] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [customPassword, setCustomPassword] = useState('')

  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // Load business & check session
  useEffect(() => {
    let isMounted = true

    async function init() {
      if (!slug) {
        if (isMounted) {
          setBusinessError('Slug bisnis tidak valid')
          setPageLoading(false)
        }
        return
      }

      setPageLoading(true)
      const { data, error } = await getBusinessBySlug(slug)
      if (!isMounted) return

      if (error || !data) {
        setBusinessError(`Bisnis dengan slug "${slug}" tidak ditemukan.`)
        setPageLoading(false)
        return
      }

      setBusiness(data)

      // If already logged in, check role
      if (user) {
        const superCheck = await isSuperAdmin(user.email)
        if (isMounted) {
          setIsSuper(superCheck)
          setIsCurrentOwner(user.email === `${data.slug}@smartqr.app`)
          setPageLoading(false)
        }
        return
      }

      // If not logged in, check if saved PIN exists in localStorage
      const savedPin = localStorage.getItem(`smartqr_pin_${data.slug}`)
      if (savedPin) {
        setAutoLoggingIn(true)
        const emailToUse = `${data.slug}@smartqr.app`
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: savedPin,
        })

        if (!isMounted) return

        if (!authErr && authData.user) {
          setSelectedBusiness({ ...data, role: 'owner' } as any)
          sessionStorage.setItem('smartqr_selected_business_id', data.id)
          await refetch()
          navigate('/admin', { replace: true })
          return
        } else {
          // Saved PIN is no longer valid, remove it
          localStorage.removeItem(`smartqr_pin_${data.slug}`)
          setAutoLoggingIn(false)
          setErrorMsg('PIN tersimpan sudah kadaluarsa. Silakan masukkan PIN kembali.')
        }
      }

      if (isMounted) {
        setPageLoading(false)
      }
    }

    if (!authLoading) {
      init()
    }

    return () => {
      isMounted = false
    }
  }, [slug, user, authLoading, navigate, refetch, setSelectedBusiness])

  // Direct bypass to dashboard for logged-in users
  const handleDirectAccess = () => {
    if (!business) return
    setSelectedBusiness({ ...business, role: 'owner' } as any)
    sessionStorage.setItem('smartqr_selected_business_id', business.id)
    navigate('/admin', { replace: true })
  }

  // Logout current session so user can test pure login
  const handleSignOut = async () => {
    setSubmitting(true)
    await supabase.auth.signOut()
    if (business) {
      localStorage.removeItem(`smartqr_pin_${business.slug}`)
      sessionStorage.removeItem('smartqr_selected_business_id')
    }
    setIsSuper(false)
    setIsCurrentOwner(false)
    setPin('')
    setErrorMsg(null)
    setSubmitting(false)
    window.location.reload()
  }

  // Submit PIN login
  const submitWithPin = async (pinValue: string) => {
    if (!business) return
    if (pinValue.length < 4) {
      setErrorMsg('Masukkan minimal 4 digit PIN')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const emailToUse = `${business.slug}@smartqr.app`

      // Step 1: Coba login langsung via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: pinValue,
      })

      if (!error && data.user) {
        // Auth login berhasil, pastikan relasi business_members disinkronisasi
        try {
          await (supabase as any).rpc('verify_business_pin', {
            p_slug: business.slug,
            p_pin: pinValue,
          })
        } catch {
          // fallback dijalankan di getMyBusinesses
        }

        if (rememberMe) {
          localStorage.setItem(`smartqr_pin_${business.slug}`, pinValue)
        } else {
          localStorage.removeItem(`smartqr_pin_${business.slug}`)
        }
        setSelectedBusiness({ ...business, role: 'owner' } as any)
        sessionStorage.setItem('smartqr_selected_business_id', business.id)
        await refetch()
        navigate('/admin', { replace: true })
        return
      }

      // Step 2: Fallback — verifikasi PIN via RPC (dan auto-sync di database)
      const { data: pinOk, error: rpcErr } = await (supabase as any).rpc('verify_business_pin', {
        p_slug: business.slug,
        p_pin: pinValue,
      })

      if (rpcErr || !pinOk) {
        // PIN benar-benar salah
        throw new Error('PIN salah untuk bisnis ini. Silakan periksa kembali.')
      }

      // PIN cocok! verify_business_pin otomatis men-sync auth.users dan identities di DB.
      // Coba signInWithPassword sekali lagi sekarang:
      const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: pinValue,
      })

      if (!retryErr && retryData.user) {
        if (rememberMe) localStorage.setItem(`smartqr_pin_${business.slug}`, pinValue)
        else localStorage.removeItem(`smartqr_pin_${business.slug}`)
        setSelectedBusiness({ ...business, role: 'owner' } as any)
        sessionStorage.setItem('smartqr_selected_business_id', business.id)
        await refetch()
        navigate('/admin', { replace: true })
        return
      }

      // Step 3: Jika akun auth belum ada sama sekali di GoTrue, buat akun via signUp
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: emailToUse,
        password: pinValue,
      })

      if (!signUpErr && signUpData.user) {
        // Pastikan relasi dan password ter-sync ulang setelah sign up
        await (supabase as any).rpc('verify_business_pin', {
          p_slug: business.slug,
          p_pin: pinValue,
        })
        if (rememberMe) localStorage.setItem(`smartqr_pin_${business.slug}`, pinValue)
        else localStorage.removeItem(`smartqr_pin_${business.slug}`)
        setSelectedBusiness({ ...business, role: 'owner' } as any)
        sessionStorage.setItem('smartqr_selected_business_id', business.id)
        await refetch()
        navigate('/admin', { replace: true })
        return
      }

      // Jika masih gagal (misal email confirmation tertahan di dashboard Supabase)
      throw new Error(
        retryErr?.message || signUpErr?.message || 'Gagal masuk akun. Minta Super Admin untuk klik "Resync PIN" di dashboard.'
      )
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa PIN Anda.')
      setPin('')
    } finally {
      setSubmitting(false)
    }
  }

  // Keypad click handler
  const handleKeyClick = (val: string) => {
    if (submitting) return
    setErrorMsg(null)
    if (pin.length < 6) {
      const nextPin = pin + val
      setPin(nextPin)
      if (nextPin.length === 6) {
        submitWithPin(nextPin)
      }
    }
  }

  const handleDelete = () => {
    if (submitting) return
    setErrorMsg(null)
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (submitting) return
    setErrorMsg(null)
    setPin('')
  }

  // Submit Custom Email login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: customEmail,
        password: customPassword,
      })

      if (error) throw error

      setSelectedBusiness({ ...business, role: 'owner' } as any)
      sessionStorage.setItem('smartqr_selected_business_id', business.id)
      await refetch()
      navigate('/admin', { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || 'Email atau password salah')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading || authLoading) {
    return <Loading label="Menyiapkan akses admin..." />
  }

  if (businessError || !business) {
    return (
      <main className="min-h-[100dvh] bg-surface flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-ink">Bisnis Tidak Ditemukan</h1>
          <p className="text-sm text-ink-muted">{businessError}</p>
          <div className="pt-2">
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-white font-bold text-sm shadow-md shadow-primary/30 active:scale-95 transition-transform"
            >
              Ke Halaman Login Admin
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Auto-logging in with saved PIN state
  if (autoLoggingIn) {
    return (
      <main className="min-h-[100dvh] bg-primary flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 animate-pulse text-primary" />
          </div>
          <h1 className="text-xl font-extrabold text-ink">Memverifikasi PIN...</h1>
          <p className="text-sm text-ink-muted">
            Sedang menghubungkan ke akun admin <strong>{business.name}</strong> dengan PIN tersimpan di perangkat ini.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(`smartqr_pin_${business.slug}`)
                setAutoLoggingIn(false)
              }}
              className="text-xs font-semibold text-ink-muted hover:text-primary transition-colors underline"
            >
              Batal & Gunakan PIN Lain
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-primary flex flex-col justify-between">
      {/* Top Banner / Store Header */}
      <section className="relative pt-8 pb-8 px-6 text-center overflow-hidden flex flex-col items-center">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-24 -left-20 w-52 h-52 rounded-full bg-white/10" aria-hidden="true" />

        {/* Business Logo */}
        <div className="relative w-20 h-20 rounded-[24px] bg-white p-1 flex items-center justify-center shadow-xl shadow-primary-900/40 overflow-hidden">
          {business.logo_url ? (
            <img src={business.logo_url} alt="" className="w-full h-full object-cover rounded-[20px]" />
          ) : (
            <span className="w-full h-full rounded-[20px] bg-primary-100 flex items-center justify-center text-primary">
              <BusinessTypeIcon type={business.business_type} />
            </span>
          )}
        </div>

        <h1 className="relative mt-3 text-2xl font-black text-white tracking-tight">{business.name}</h1>
        <p className="relative mt-0.5 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
          Akses Admin · /{business.slug}
        </p>
      </section>

      {/* Main Sheet Container */}
      <section className="relative bg-white rounded-t-[32px] px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(36,28,115,0.18)] sm:mx-auto sm:w-full sm:max-w-md sm:mb-8 sm:rounded-[32px] flex-1 flex flex-col">
        <div className="w-10 h-1 rounded-full bg-outline mx-auto mb-4" aria-hidden="true" />

        {/* Active Session Notice: Super Admin */}
        {isSuper && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sesi Super Admin Terdeteksi</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Anda sedang login sebagai <strong>{user?.email}</strong>. Anda dapat menguji input PIN 6-digit di bawah atau langsung membuka dashboard toko ini.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDirectAccess}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Langsung Masuk Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={submitting}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100/50 active:scale-95 transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-700" />
                <span>Logout Sesi</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Session Notice: Current Owner */}
        {!isSuper && isCurrentOwner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sesi Toko Sedang Aktif</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Perangkat ini sudah terhubung ke akun admin <strong>{business.name}</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDirectAccess}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Buka Dashboard Toko</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={submitting}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-semibold text-xs hover:bg-emerald-100/50 active:scale-95 transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-emerald-700" />
                <span>Keluar / Ganti Akun</span>
              </button>
            </div>
          </div>
        )}

        {!useEmailMode ? (
          /* PIN MODE */
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-ink">Masukkan PIN Admin</h2>
              <p className="text-xs text-ink-muted">
                Masukkan 6-digit PIN yang Anda terima saat pendaftaran bisnis
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-700 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Visual PIN Dots */}
            <div
              className="py-4 my-auto flex justify-center items-center gap-3 cursor-pointer"
              onClick={() => hiddenInputRef.current?.focus()}
              title="Klik untuk mengetik langsung"
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = index < pin.length
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-primary scale-110 shadow-sm shadow-primary/40'
                        : 'border-2 border-outline bg-surface'
                    }`}
                  />
                )
              })}
              {/* Hidden input for physical keyboard / mobile paste support */}
              <input
                ref={hiddenInputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                disabled={submitting}
                onChange={(e) => {
                  setErrorMsg(null)
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setPin(clean)
                  if (clean.length === 6) {
                    submitWithPin(clean)
                  }
                }}
                className="sr-only"
                autoComplete="off"
                aria-label="Input PIN"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-primary accent-primary cursor-pointer"
                />
                Ingat saya (masuk otomatis di perangkat ini)
              </label>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto w-full select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleKeyClick(digit)}
                  className="h-12 rounded-2xl bg-surface font-extrabold text-lg text-ink hover:bg-primary-50 active:bg-primary-100 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                disabled={submitting}
                onClick={handleClear}
                className="h-12 rounded-2xl text-xs font-bold text-ink-muted hover:bg-surface active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleKeyClick('0')}
                className="h-12 rounded-2xl bg-surface font-extrabold text-lg text-ink hover:bg-primary-50 active:bg-primary-100 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="h-12 rounded-2xl text-ink-muted hover:bg-surface active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                aria-label="Hapus digit"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => submitWithPin(pin)}
                size="lg"
                isLoading={submitting}
                disabled={pin.length < 4}
                className="w-full flex items-center justify-center gap-2"
              >
                {submitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null)
                  setUseEmailMode(true)
                }}
                className="w-full py-2 text-center text-xs font-semibold text-primary hover:underline"
              >
                Atau masuk dengan Email & Password
              </button>
            </div>
          </div>
        ) : (
          /* EMAIL FALLBACK MODE */
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-lg font-black text-ink">Login dengan Email</h2>
                <p className="text-xs text-ink-muted">
                  Gunakan email akun terdaftar Anda untuk masuk ke {business.name}
                </p>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-700"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1 ml-1">Email Akun</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full h-12 px-4 rounded-2xl border-2 border-outline bg-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1 ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Password Anda"
                    className="w-full h-12 px-4 rounded-2xl border-2 border-outline bg-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <Button type="submit" size="lg" isLoading={submitting} className="w-full mt-2">
                  {submitting ? 'Memproses...' : 'Masuk dengan Email'}
                </Button>
              </form>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null)
                setUseEmailMode(false)
              }}
              className="mt-4 w-full py-2 text-center text-xs font-semibold text-primary hover:underline"
            >
              Kembali ke Login PIN
            </button>
          </div>
        )}

        {/* Public Hub link */}
        <div className="mt-4 pt-3 border-t border-outline/50 flex justify-between items-center text-xs">
          <a
            href={`/q/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted hover:text-primary flex items-center gap-1 font-medium"
          >
            <span>Lihat Halaman Pelanggan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link to="/admin/login" className="text-ink-muted hover:text-primary font-medium">
            Login Lainnya
          </Link>
        </div>
      </section>
    </main>
  )
}
