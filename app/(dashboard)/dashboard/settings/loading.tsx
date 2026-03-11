export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6 max-w-3xl space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-neutral-100 rounded-lg" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 bg-neutral-100 rounded" />
              <div className="h-10 bg-neutral-50 rounded-lg" />
            </div>
          ))}
          <div className="h-9 w-24 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
