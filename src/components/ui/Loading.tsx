export function Loading({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]" role="status">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-ink-muted">{label}</p>
      </div>
    </div>
  )
}
