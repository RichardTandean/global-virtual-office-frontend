export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-2.5 w-24 rounded-pill bg-subtle/60 animate-pulse" />
        <div className="h-9 w-2/3 rounded-sm bg-subtle/60 animate-pulse" />
        <div className="h-3 w-1/2 rounded-sm bg-subtle/40 animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <div className="h-44 rounded-lg border border-line bg-surface animate-pulse" />
        <div className="h-44 rounded-lg border border-line bg-surface animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-md border border-line bg-surface animate-pulse"
          />
        ))}
      </div>

      <div className="rounded-md border border-line bg-surface p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-sm bg-subtle/60 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
