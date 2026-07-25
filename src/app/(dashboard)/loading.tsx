export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-40 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-card bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-5 w-32 rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-card bg-muted" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-btn bg-muted" />
          ))}
        </div>
      </div>
      <div className="h-64 rounded-card bg-muted" />
    </div>
  );
}
