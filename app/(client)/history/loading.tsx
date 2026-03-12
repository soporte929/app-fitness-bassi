export default function HistoryLoading() {
  return (
    <div className="px-4 pt-6 pb-4 space-y-3">
      <div className="h-7 w-40 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4 space-y-2">
          <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded animate-pulse" />
          <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
