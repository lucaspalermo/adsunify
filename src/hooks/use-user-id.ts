"use client"

import { useSession } from "next-auth/react"

export function useUserId() {
  const { data: session, status } = useSession()

  // Return the user ID from session, or null if not authenticated
  if (status === "loading") return null
  if (session?.user?.id) return session.user.id as string

  // Try email-based lookup as fallback
  if (session?.user?.email) {
    // This will be resolved on first API call
    return session.user.email
  }

  return null
}
