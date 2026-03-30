"use client"

import { useCallback } from "react"
import { useGamificationStore } from "@/stores/gamification-store"

interface TrackResult {
  missionId: string
  missionTitle: string
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  newTitle?: string
}

export function useTrackAction() {
  const { showXpToast, showLevelUp } = useGamificationStore()

  const trackAndNotify = useCallback(async (userId: string, action: string, metadata?: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, metadata }),
      })
      const data = await res.json()

      if (data.results && data.results.length > 0) {
        for (const result of data.results as TrackResult[]) {
          // Show XP toast
          showXpToast(result.xpAwarded, `Missao: ${result.missionTitle}`)

          // Show level up if applicable
          if (result.leveledUp && result.newLevel && result.newTitle) {
            setTimeout(() => {
              showLevelUp(result.newLevel!, result.newTitle!)
            }, 2000) // Delay after XP toast
          }
        }
      }

      return data.results || []
    } catch {
      return []
    }
  }, [showXpToast, showLevelUp])

  return trackAndNotify
}
