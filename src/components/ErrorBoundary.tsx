import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-red-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-900">Terjadi Error</h2>
                <p className="text-sm text-red-700 mt-1">Aplikasi mengalami masalah saat rendering.</p>
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900">
                Lihat Detail Error
              </summary>
              <pre className="mt-2 p-3 bg-stone-100 rounded-lg text-xs text-stone-800 overflow-auto max-h-48">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Refresh Halaman
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.reload() }}
                className="px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors"
              >
                Clear Cache
              </button>
            </div>

            <div className="mt-4 text-xs text-stone-500">
              <p>Jika masalah berlanjut, coba:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Refresh halaman (Ctrl+R)</li>
                <li>Buka DevTools (F12) dan cek Console</li>
                <li>Hapus cookie/localStorage</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
