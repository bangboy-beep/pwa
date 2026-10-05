import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

export default function AdminLoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/admin'
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Akun berhasil dibuat. Silakan cek email jika verifikasi diperlukan.')
      }
    } catch (e: any) {
      setMessage(e?.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(240,136,58,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(240,136,58,0.2) 0%, transparent 50%), linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
        }} />
        {/* Darken overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-xl" style={{ background: 'linear-gradient(135deg, #f0883a 0%, #e06c18 100%)' }}>
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h3v3h-3v-3zm-2 2h7v7h-7v-7zm2 2v3h3v-3h-3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">SmartQR</h1>
        <p className="text-sm text-white/70 mt-1 font-medium">Admin Panel</p>
        <p className="text-xs text-white/50 mt-2 max-w-[240px] mx-auto">Kelola bisnis Anda dalam satu genggaman</p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-100">
          {/* Tab switcher */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all duration-200 ${
                mode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all duration-200 ${
                mode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full h-12 px-4 rounded-xl border border-[#79747E] bg-transparent text-sm outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[#79747E] bg-transparent text-sm outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 active:bg-stone-100 rounded-full"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {message && (
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-xs text-stone-700 text-center font-medium">
                {message}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#f0883a] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
              {!loading && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="mt-6 text-center text-xs text-stone-400 font-medium">
              Belum punya akun?{' '}
              <button onClick={() => setMode('signup')} className="text-[#f0883a] font-bold hover:underline">
                Daftar sekarang
              </button>
            </p>
          )}
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-white/30 mt-4">© 2024 SmartQR. All rights reserved.</p>
      </div>
    </main>
  )
}
