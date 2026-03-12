export default function ProgressLoading() {
  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="h-7 w-36 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-2" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" />
            <div className="h-7 w-20 bg-[var(--bg-elevated)] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
        <div className="h-4 w-28 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-40 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
