"use client"

import { useGamificationStore } from "@/stores/gamification-store"
import { XpToast } from "@/components/gamification/xp-toast"
import { LevelUpModal } from "@/components/gamification/level-up-modal"

export function GamificationProvider() {
  const { xpToast, levelUp, hideXpToast, hideLevelUp } =
    useGamificationStore()

  return (
    <>
      <XpToast
        xp={xpToast.xp}
        message={xpToast.message}
        visible={xpToast.visible}
        onClose={hideXpToast}
      />
      <LevelUpModal
        visible={levelUp.visible}
        level={levelUp.level}
        title={levelUp.title}
        onClose={hideLevelUp}
      />
    </>
  )
}
