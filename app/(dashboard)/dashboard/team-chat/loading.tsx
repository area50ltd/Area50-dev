export default function Loading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      <div className="h-14 bg-white border-b border-neutral-100" />
      <div className="flex-1 flex">
        <div className="w-60 border-r border-neutral-100 p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral-100 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 flex flex-col p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex-shrink-0" />
              <div className="h-12 w-2/3 bg-neutral-100 rounded-xl" />
            </div>
          ))}
          <div className="mt-auto h-12 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
