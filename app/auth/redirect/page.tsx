import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

/**
 * Role-based redirect after sign-in.
 * Clerk sends all users here after login (signInFallbackRedirectUrl).
 * We read the user's role from DB and forward to the right page.
 */
export default async function AuthRedirectPage() {
  const user = await getCurrentUser()

  // Not in DB yet — happens on very first sign-up before webhook fires.
  // Clerk webhook will create the user row; send them to onboarding.
  if (!user) {
    redirect('/onboarding')
  }

  // Existing user with no company assigned yet
  if (!user.company_id) {
    redirect('/onboarding')
  }

  // Route by role
  switch (user.role) {
    case 'super_admin':
      redirect('/super-admin')
    case 'agent':
      redirect('/agent')
    case 'maintenance':
      redirect('/dashboard')
    default:
      // admin, customer, anything else → dashboard
      redirect('/dashboard')
  }
}
