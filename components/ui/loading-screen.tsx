export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold tracking-[0.2em] text-[var(--text-primary)]">BASSI</p>
      <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
    </div>
  )
}
