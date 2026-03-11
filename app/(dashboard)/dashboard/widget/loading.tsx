export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
                <div className="h-4 w-28 bg-neutral-100 rounded" />
                <div className="h-10 bg-neutral-50 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-neutral-100 p-5">
            <div className="h-5 w-24 bg-neutral-100 rounded mb-4" />
            <div className="h-96 bg-neutral-50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
