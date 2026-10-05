// Simple toast store - kept separate to avoid fast-refresh warnings
export interface ToastData {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

export const toastList: ToastData[] = []

export const toast = {
  success: (message: string, duration?: number) => {
    toastList.push({ id: Math.random().toString(36).slice(2), type: 'success', message, duration })
  },
  error: (message: string, duration?: number) => {
    toastList.push({ id: Math.random().toString(36).slice(2), type: 'error', message, duration })
  },
  info: (message: string, duration?: number) => {
    toastList.push({ id: Math.random().toString(36).slice(2), type: 'info', message, duration })
  },
}
