// Global Toast container — renders all active toasts from the shared toastList store.
// Imported once in main.tsx so every useToast() caller shares one visible stack.

import { useState, createElement as h } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { toastList, toast } from './toastStore'
import type { ToastData } from './toastStore'

export { toast }

const ICON_COLORS: Record<ToastData['type'], string> = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-primary-300',
}

const ICONS: Record<ToastData['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export function ToastContainer() {
  // Tick counter forces re-render when the shared array mutates
  const [, setTick] = useState(0)

  const dismiss = (id: string) => {
    const idx = toastList.findIndex((t) => t.id === id)
    if (idx !== -1) toastList.splice(idx, 1)
    setTick((n) => n + 1)
  }

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}
      aria-live="polite"
    >
      {toastList.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-fade-in">
          <div className="flex items-center gap-3 pl-4 pr-2 py-3 rounded-2xl bg-ink text-white shadow-xl">
            {h(ICONS[t.type], { className: `w-5 h-5 shrink-0 ${ICON_COLORS[t.type]}` })}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
