export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-9 w-40 bg-neutral-100 rounded-lg" />
          <div className="h-9 w-28 bg-neutral-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-neutral-100 rounded" />
                  <div className="h-3 w-20 bg-neutral-100 rounded" />
                </div>
                <div className="h-6 w-16 bg-neutral-100 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(j => <div key={j} className="h-10 bg-neutral-50 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
