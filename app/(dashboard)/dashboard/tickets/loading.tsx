export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-neutral-100 rounded-lg" />
          <div className="h-9 flex-1 bg-neutral-100 rounded-lg" />
          <div className="h-9 w-24 bg-neutral-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-neutral-100 rounded-full" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <div className="h-11 bg-neutral-50 border-b border-neutral-100" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-neutral-50 px-4 flex items-center gap-4">
              <div className="h-4 w-20 bg-neutral-100 rounded" />
              <div className="h-4 flex-1 bg-neutral-100 rounded" />
              <div className="h-6 w-16 bg-neutral-100 rounded-full" />
              <div className="h-6 w-16 bg-neutral-100 rounded-full" />
              <div className="h-4 w-24 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
