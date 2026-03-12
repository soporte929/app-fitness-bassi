export default function DashboardLoading() {
  return (
    <div className="px-6 py-6 space-y-4">
      <div className="h-8 w-48 bg-[var(--bg-elevated)] rounded-lg animate-pulse mb-2" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
            <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-[var(--bg-elevated)] rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] p-4">
        <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded animate-pulse mb-3" />
        <div className="h-48 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
