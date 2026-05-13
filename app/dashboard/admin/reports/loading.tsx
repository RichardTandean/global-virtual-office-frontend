export default function ReportsLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-3">
        <div className="h-2.5 w-20 rounded-pill bg-subtle/60 animate-pulse" />
        <div className="h-9 w-1/2 rounded-sm bg-subtle/60 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-md border border-line bg-surface animate-pulse"
          />
        ))}
      </div>
      <div className="rounded-md border border-line bg-surface p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-sm bg-subtle/60 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
