import { toastList } from '../components/ui/toastStore'
import type { ToastData } from '../components/ui/toastStore'

export function useToast() {
  const showToast = (type: ToastData['type'], message: string, duration?: number) => {
    const id = Math.random().toString(36).slice(2)
    toastList.push({ id, type, message, duration })
  }

  const removeToast = (id: string) => {
    const index = toastList.findIndex(t => t.id === id)
    if (index !== -1) {
      toastList.splice(index, 1)
    }
  }

  return { showToast, removeToast, toasts: toastList }
}
