// Global Toast container — renders all active toasts from the shared toastList store.
// Imported once in main.tsx so every useToast() caller shares one visible stack.

import { useState, createElement as h } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { toastList, toast } from './toastStore'
import type { ToastData } from './toastStore'

export { toast }

const COLORS: Record<ToastData['type'], string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toastList.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md ${COLORS[toast.type]}`}>
            {h(ICONS[toast.type], { className: 'w-5 h-5 flex-shrink-0 mt-0.5' })}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
