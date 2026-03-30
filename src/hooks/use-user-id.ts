"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function useUserId() {
  const { data: session } = useSession()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id)
    } else {
      // Fallback: fetch demo user ID from database
      fetch("/api/user?userId=demo")
        .then(r => r.json())
        .then(data => setUserId(data.id || null))
        .catch(() => setUserId(null))
    }
  }, [session])

  return userId
}
