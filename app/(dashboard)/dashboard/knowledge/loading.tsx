export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-100 p-6">
              <div className="h-32 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200" />
            </div>
            <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
              <div className="h-11 bg-neutral-50 border-b border-neutral-100" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 border-b border-neutral-50 px-4 flex items-center gap-4">
                  <div className="h-8 w-8 bg-neutral-100 rounded" />
                  <div className="h-4 flex-1 bg-neutral-100 rounded" />
                  <div className="h-6 w-20 bg-neutral-100 rounded-full" />
                  <div className="h-4 w-8 bg-neutral-100 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
            <div className="h-5 w-28 bg-neutral-100 rounded" />
            {[1,2,3].map(i => <div key={i} className="h-16 bg-neutral-50 rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
