import { useState } from 'react'
import { Mail, Lock, ArrowRight, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'
import { isSuperAdmin } from '../../lib/config/admin'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const CURRENT_YEAR = new Date().getFullYear()

export default function AdminLoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const superAdmin = await isSuperAdmin(data.user?.email)
        window.location.href = superAdmin ? '/super' : '/admin'
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Akun berhasil dibuat. Silakan cek email jika verifikasi diperlukan.' })
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-primary flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 min-h-[240px] flex flex-col items-center justify-center px-6 pt-10 pb-14 text-center overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-24 -left-20 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative w-16 h-16 rounded-[22px] bg-white flex items-center justify-center shadow-xl shadow-primary-900/30">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h1 className="relative mt-4 text-2xl font-extrabold text-white tracking-tight">SmartQR</h1>
        <p className="relative mt-1 text-sm text-white/80 font-medium text-balance">
          Kelola bisnis Anda dalam satu genggaman
        </p>
      </section>

      {/* Sheet */}
      <section className="relative -mt-8 bg-white rounded-t-[32px] px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(36,28,115,0.18)] sm:mx-auto sm:w-full sm:max-w-md sm:mb-10 sm:rounded-[32px] animate-sheet-up">
        <div className="w-10 h-1 rounded-full bg-outline mx-auto mb-5" aria-hidden="true" />

        <h2 className="text-xl font-extrabold text-ink tracking-tight">
          {mode === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          {mode === 'login' ? 'Masuk untuk melanjutkan ke dashboard.' : 'Daftar gratis dan mulai dalam hitungan menit.'}
        </p>

        <div className="flex bg-surface rounded-full p-1 mt-5" role="tablist">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setMessage(null)
              }}
              className={`flex-1 h-10 rounded-full text-sm font-bold transition-all ${
                mode === m ? 'bg-white text-primary shadow-sm' : 'text-ink-muted'
              }`}
            >
              {m === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 mt-5">
          <div className="relative">
            <Mail className="absolute left-4 top-[38px] w-5 h-5 text-ink-muted pointer-events-none z-10" aria-hidden="true" />
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="pl-12"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-[38px] w-5 h-5 text-ink-muted pointer-events-none z-10" aria-hidden="true" />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="pl-12"
            />
          </div>

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
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          {'© '}
          {CURRENT_YEAR} SmartQR
        </p>
      </section>
    </main>
  )
}
