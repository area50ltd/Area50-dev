import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

/**
 * Role-based redirect after sign-in.
 * Clerk sends all users here after login (signInFallbackRedirectUrl).
 * We read the user's role from DB and forward to the right page.
 */
export default async function AuthRedirectPage() {
  const user = await getCurrentUser()

  // Not in DB yet — brand new sign-up, needs onboarding
  if (!user) {
    redirect('/onboarding')
  }

  // Super admin — never has a company_id, go straight to panel
  if (user.role === 'super_admin') {
    redirect('/super-admin')
  }

  // Existing user with no company yet — needs onboarding
  if (!user.company_id) {
    redirect('/onboarding')
  }

  // Route by role
  switch (user.role) {
    case 'agent':
      redirect('/agent')
    default:
      redirect('/dashboard')
  }
}
