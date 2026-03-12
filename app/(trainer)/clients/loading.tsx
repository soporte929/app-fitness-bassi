export default function ClientsLoading() {
  return (
    <div className="px-6 py-6 space-y-3">
      <div className="h-8 w-32 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-4" />
      <div className="h-10 bg-[var(--bg-elevated)] rounded-xl animate-pulse mb-2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--bg-elevated)] animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 bg-[var(--bg-elevated)] rounded animate-pulse" />
            <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
