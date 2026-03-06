import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { NavigationProgress } from '@/components/shared/NavigationProgress'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Area50 — Hybrid AI + Human Customer Care',
    template: '%s | Area50',
  },
  description:
    'Multi-tenant AI-powered customer support platform. Handle routine queries automatically, escalate complex issues to human agents.',
  keywords: ['customer support', 'AI chat', 'helpdesk', 'WhatsApp', 'voice support'],
  openGraph: {
    title: 'Area50 — Hybrid AI + Human Customer Care',
    description: 'AI That Handles Support. Humans That Close Deals.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/login"
      signInFallbackRedirectUrl="/auth/redirect"
      signUpFallbackRedirectUrl="/auth/redirect"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        </head>
        <body className="min-h-screen bg-background font-body antialiased">
          <Providers>
            <NavigationProgress />
            {children}
            <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 4000 }} />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
