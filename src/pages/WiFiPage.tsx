// SmartQR WiFi Management — Storyboard Screen 5
// Route: /admin/wifi
// Visual redesign only — all functionality preserved.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBusiness } from '../providers/BusinessProvider'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { getWifiSettings } from '../lib/wifi/service'
import {
  getWifiNetworks,
  createWifiNetwork,
  updateWifiNetwork,
  deleteWifiNetwork,
} from '../lib/wifi/networks'
import { Loading } from '../components/ui/Loading'
import { useToast } from '../hooks/useToast'
import { cn } from '../components/ui/utils'
import {
  Wifi,
  Eye,
  EyeOff,
  QrCode,
  Check,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { WiFiNetwork } from '../types'

type SecurityType = 'WPA' | 'WEP' | 'nopass' | 'WPA2'

interface NetworkForm {
  name: string
  ssid: string
  password: string
  security_type: SecurityType
  is_active: boolean
  sort_order: number
}

export default function WifiPage() {
  const { businessId: routeBusinessId } = useParams<{ businessId?: string }>()
  const { businesses, selectedBusiness } = useBusiness()
  const { showToast } = useToast()
  useAuthGuard()

  const currentBusiness = routeBusinessId
    ? businesses.find((b) => b.id === routeBusinessId) || selectedBusiness
    : selectedBusiness || businesses[0] || null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | false>(false)
  const [networks, setNetworks] = useState<WiFiNetwork[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<NetworkForm>({
    name: '',
    ssid: '',
    password: '',
    security_type: 'WPA2',
    is_active: true,
    sort_order: 0,
  })
  const [editingNetwork, setEditingNetwork] = useState<WiFiNetwork | null>(null)

  const role = currentBusiness?.role || 'staff'
  const isReadOnly = role === 'staff'

  useEffect(() => {
    async function load() {
      if (!currentBusiness) { setLoading(false); return }
      setLoading(true)
      const { data, error } = await getWifiSettings(currentBusiness.id)
      if (error && error.message && !error.message.includes('No rows found')) console.error(error)
      else if (!data) {
        const { data: settingsData } = await getWifiSettings(currentBusiness.id)
        if (!settingsData?.ssid) {
          await createWifiNetwork(currentBusiness.id, {
            name: 'WiFi Utama',
            ssid: '',
            password: '',
            security_type: 'WPA2',
            is_active: true,
            sort_order: 0,
          })
        }
      }
      await loadNetworks()
      setLoading(false)
    }
    load()
  }, [currentBusiness])

  useEffect(() => {
    if (selectedNetwork) {
      const active = networks.find(n => n.id === selectedNetwork)
      if (active) {
        setForm({
          name: active.name,
          ssid: active.ssid,
          password: active.password || '',
          security_type: active.security_type as SecurityType,
          is_active: active.is_active,
          sort_order: active.sort_order,
        })
        setEditingNetwork(active)
        setShowAddForm(false)
      }
    }
  }, [selectedNetwork, networks])

  async function loadNetworks() {
    if (!currentBusiness) return
    const { data } = await getWifiNetworks(currentBusiness.id)
    if (data) {
      setNetworks(data)
      if (data.length > 0) {
        if (!selectedNetwork) {
          setSelectedNetwork(data[0].id)
        }
        setShowAddForm(false)
      } else {
        // Jika belum ada wifi sama sekali, otomatis tampilkan form tambah baru
        setSelectedNetwork(null)
        setEditingNetwork(null)
        setForm({
          name: '',
          ssid: '',
          password: '',
          security_type: 'WPA2',
          is_active: true,
          sort_order: 0,
        })
        setShowAddForm(true)
      }
    }
  }

  const handleSave = async () => {
    if (!currentBusiness || isReadOnly) return
    if (!form.ssid.trim()) { showToast('error', 'Nama WiFi (SSID) wajib diisi'); return }
    setSaving(true)
    if (editingNetwork) {
      const { error } = await updateWifiNetwork(editingNetwork.id, {
        ...form,
        ssid: form.ssid.trim(),
        password: form.password.trim() || undefined,
      })
      if (error) showToast('error', error.message || 'Gagal menyimpan pengaturan WiFi')
      else { showToast('success', 'Pengaturan WiFi berhasil disimpan!'); setEditingNetwork(null) }
    } else {
      const { data, error } = await createWifiNetwork(currentBusiness.id, {
        name: form.name.trim() || 'WiFi Baru',
        ssid: form.ssid.trim(),
        password: form.password.trim() || undefined,
        security_type: form.security_type,
        is_active: form.is_active,
        sort_order: networks.length,
      })
      if (error) {
        showToast('error', error.message || 'Gagal menambahkan WiFi')
      } else if (data) {
        showToast('success', 'WiFi baru berhasil ditambahkan!')
        setShowAddForm(false)
        setSelectedNetwork(data.id)
      }
    }
    setSaving(false)
    loadNetworks()
  }

  const handleDelete = async (networkId: string) => {
    if (!confirm('Hapus WiFi ini?')) return
    const { error } = await deleteWifiNetwork(networkId)
    if (error) showToast('error', error.message || 'Gagal menghapus WiFi')
    else { showToast('success', 'WiFi berhasil dihapus!'); if (selectedNetwork === networkId) setSelectedNetwork(null); loadNetworks() }
  }

  const handleEdit = (network: WiFiNetwork) => {
    setEditingNetwork(network)
    setForm({
      name: network.name,
      ssid: network.ssid,
      password: network.password || '',
      security_type: network.security_type as SecurityType,
      is_active: network.is_active,
      sort_order: network.sort_order,
    })
    setSelectedNetwork(network.id)
    setShowAddForm(false)
  }

  const handleCopyPassword = async () => {
    if (!form.password) return
    await navigator.clipboard.writeText(form.password)
    setCopied(form.password)
    setTimeout(() => setCopied(false), 2000)
  }


  if (loading) return <Loading />
  if (!currentBusiness) return <div className="p-12 text-center text-stone-500">Bisnis tidak ditemukan</div>

  const activeNetwork = networks.find(n => n.id === selectedNetwork) || networks[0] || null

  return (
    <div className="w-full space-y-5 pb-4">

      {/* ── STATUS PILL ── */}
      <div
        className={cn(
          "rounded-2xl px-5 py-4 flex items-center justify-between border shadow-sm transition-all duration-300",
          (showAddForm ? form.is_active : activeNetwork?.is_active !== false)
            ? "bg-orange-50 border-orange-200"
            : "bg-stone-50 border-stone-200"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            (showAddForm ? form.is_active : activeNetwork?.is_active !== false)
              ? "bg-[#f0883a] text-white shadow-sm"
              : "bg-stone-200 text-stone-400"
          )}>
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <p className={cn(
              "font-bold text-[16px] leading-tight",
              (showAddForm ? form.is_active : activeNetwork?.is_active !== false) ? "text-stone-900" : "text-stone-500"
            )}>
              {showAddForm ? (form.name || 'WiFi Baru') : (activeNetwork?.name || 'Belum diatur')}
            </p>
            <p className={cn(
              "text-[11px] mt-0.5 font-bold uppercase tracking-wider",
              (showAddForm ? form.is_active : activeNetwork?.is_active !== false) ? "text-[#f0883a]" : "text-stone-400"
            )}>
              {showAddForm
                ? (form.is_active ? 'WiFi Aktif' : 'WiFi Nonaktif')
                : (activeNetwork?.is_active !== false ? 'WiFi Aktif' : 'WiFi Nonaktif')}
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => {
              setSelectedNetwork(null)
              setEditingNetwork(null)
              setForm({
                name: '',
                ssid: '',
                password: '',
                security_type: 'WPA2',
                is_active: true,
                sort_order: networks.length,
              })
              setShowAddForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#f0883a] text-white text-xs font-bold rounded-xl active:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah WiFi
          </button>
        )}
      </div>

      {/* ── NETWORK CARDS LIST ── */}
      <div className="space-y-3">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => { setSelectedNetwork(network.id); setShowAddForm(false) }}
            className={cn(
              "rounded-2xl p-4 border cursor-pointer transition-all duration-200",
              selectedNetwork === network.id
                ? "bg-orange-50 border-orange-300 shadow-sm"
                : "bg-white border-stone-200 hover:border-orange-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  network.is_active ? "bg-orange-100 text-[#f0883a]" : "bg-stone-100 text-stone-400"
                )}>
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-stone-900 truncate">{network.name}</p>
                  <p className="text-xs text-stone-500 font-mono truncate">{network.ssid}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {network.is_active && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    AKTIF
                  </span>
                )}
                {!isReadOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(network) }}
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {!isReadOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(network.id) }}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SETTINGS CARD ── */}
      {(activeNetwork || showAddForm) && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-5 pt-6 pb-4 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">
                Nama WiFi
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: WiFi Tamu"
                disabled={isReadOnly}
                className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all disabled:opacity-60"
              />
            </div>

            {/* SSID */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">
                Nama WiFi (SSID)
              </label>
              <input
                type="text"
                value={form.ssid}
                onChange={(e) => setForm({ ...form, ssid: e.target.value })}
                placeholder="KopiKita_Guest"
                disabled={isReadOnly}
                className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password WiFi"
                  disabled={isReadOnly}
                  className="w-full h-12 px-4 pr-24 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] transition-all disabled:opacity-60"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    disabled={isReadOnly || !form.password}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 active:bg-stone-100 transition-colors disabled:opacity-40"
                    aria-label="Salin password"
                    title="Salin password"
                  >
                    {copied === form.password ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 active:bg-stone-100 transition-colors"
                    aria-label={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Security type */}
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1.5 ml-1 uppercase tracking-wider">
                Keamanan
              </label>
              <div className="relative">
                <select
                  value={form.security_type}
                  onChange={(e) => setForm({ ...form, security_type: e.target.value as SecurityType })}
                  disabled={isReadOnly}
                  className="w-full h-12 px-4 rounded-xl border border-[#79747E] text-sm bg-transparent focus:outline-none focus:border-[#f0883a] focus:ring-1 focus:ring-[#f0883a] appearance-none disabled:opacity-60 transition-all cursor-pointer"
                >
                  <option value="WPA2">WPA2 (Recommended)</option>
                  <option value="WPA">WPA</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Tanpa Password</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active toggle */}
            {!isReadOnly && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-stone-700">Status WiFi</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0883a] shadow-inner" />
                </label>
              </div>
            )}

          </div>

          {/* Save button */}
          <div className="px-5 pb-5 pt-4 bg-white flex justify-center">
            {!isReadOnly ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 h-[48px] rounded-[12px] bg-[#f0883a] text-white text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
              >
                {saving && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {editingNetwork ? 'Simpan Perubahan' : 'Tambah WiFi'}
              </button>
            ) : (
              <p className="text-xs text-stone-400 text-center font-medium">
                Hanya owner atau admin yang dapat mengubah pengaturan.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── QR CODE SECTION ── */}
      {form.ssid && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-stone-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-[#f0883a] mb-3 shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-bold text-stone-900">
              QR WiFi Pelanggan
            </span>
            <p className="text-xs text-stone-500 mt-1 font-medium leading-relaxed">
              Scan dengan kamera untuk terhubung otomatis
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
              <QRCodeSVG
                value={`WIFI:T:${form.security_type === 'nopass' ? '' : form.security_type};S:${form.ssid};P:${form.security_type === 'nopass' ? '' : form.password};;`}
                size={180}
                level="M"
              />
            </div>
            {form.password && (
              <button
                onClick={handleCopyPassword}
                className="mt-6 w-full h-11 rounded-xl border border-stone-200 text-stone-700 text-[14px] font-bold flex items-center justify-center gap-2 active:bg-stone-50 transition-all bg-white shadow-sm"
              >
                {copied === form.password ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#f0883a]" />}
                {copied === form.password ? 'Password Tersalin' : 'Salin Password'}
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
