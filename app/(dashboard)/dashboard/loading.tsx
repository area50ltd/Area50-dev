export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen items-center justify-center bg-neutral-50">
      {/* Spinner ring + logo */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer spinning ring */}
        <div className="w-20 h-20 rounded-full border-4 border-[#E91E8C]/20 border-t-[#E91E8C] animate-spin" />

        {/* Inner logo mark — static */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center shadow-lg shadow-[#E91E8C]/30">
            <span className="text-white font-heading font-bold text-base">A</span>
          </div>
        </div>
      </div>

      {/* Wordmark */}
      <p className="font-heading font-bold text-[#1B2A4A] text-lg tracking-wide">Area50</p>
      <p className="text-neutral-400 text-sm mt-1">Loading...</p>
    </div>
  )
}
