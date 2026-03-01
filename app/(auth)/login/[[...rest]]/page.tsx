import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#1B2A4A] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E91E8C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#243460]/60 rounded-full blur-3xl" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
            <span className="text-white font-heading font-bold">A</span>
          </div>
          <span className="font-heading font-bold text-2xl text-white">Area50</span>
        </Link>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="font-heading text-4xl font-bold text-white mb-4 leading-tight">
            AI That Handles Support.
            <br />
            <span className="bg-gradient-to-r from-[#E91E8C] to-[#FF6BB5] bg-clip-text text-transparent">
              Humans That Close Deals.
            </span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed">
            Multi-channel AI customer care with smart human handoff — web, WhatsApp, and voice.
          </p>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['AO', 'CO', 'FB'].map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#1B2A4A] bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center text-white text-xs font-bold"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm">
              <strong className="text-white">120+ businesses</strong> trust Area50
            </p>
          </div>
        </div>

        {/* Bottom */}
        <p className="text-white/30 text-xs relative z-10">
          © {new Date().getFullYear()} Area50 by Digitalwebtonics
        </p>
      </div>

      {/* Right panel — Clerk sign in */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#FF6BB5] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">A</span>
            </div>
            <span className="font-heading font-bold text-xl text-[#1B2A4A]">Area50</span>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0',
                headerTitle: 'font-heading text-2xl font-bold text-[#1B2A4A]',
                headerSubtitle: 'text-neutral-500',
                formButtonPrimary:
                  'bg-[#E91E8C] hover:bg-[#c91878] text-white font-semibold rounded-full h-11 transition-colors',
                formFieldInput:
                  'rounded-lg border-neutral-200 focus:border-[#E91E8C] focus:ring-[#E91E8C]/20 h-11',
                footerActionLink: 'text-[#E91E8C] hover:text-[#c91878] font-medium',
                dividerLine: 'bg-neutral-200',
                dividerText: 'text-neutral-400',
                socialButtonsBlockButton:
                  'border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg h-11',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
