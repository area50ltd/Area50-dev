export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-neutral-100 rounded" />
          <div className="h-9 w-64 bg-neutral-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-2">
              <div className="h-3 w-24 bg-neutral-100 rounded" />
              <div className="h-8 w-16 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
              <div className="h-4 w-32 bg-neutral-100 rounded" />
              <div className="h-48 bg-neutral-50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
