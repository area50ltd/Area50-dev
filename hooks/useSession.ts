import { useUser } from '@clerk/nextjs'

export function useSession() {
  const { user, isLoaded } = useUser()
  return {
    isLoaded,
    userId: user?.id,
    name: user?.fullName ?? user?.firstName ?? 'Agent',
    email: user?.primaryEmailAddress?.emailAddress,
    avatarUrl: user?.imageUrl,
  }
}
