import { create } from "zustand"

interface GamificationState {
  xpToast: { visible: boolean; xp: number; message: string }
  levelUp: { visible: boolean; level: number; title: string }
  showXpToast: (xp: number, message: string) => void
  hideXpToast: () => void
  showLevelUp: (level: number, title: string) => void
  hideLevelUp: () => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xpToast: { visible: false, xp: 0, message: "" },
  levelUp: { visible: false, level: 0, title: "" },
  showXpToast: (xp, message) =>
    set({ xpToast: { visible: true, xp, message } }),
  hideXpToast: () =>
    set((state) => ({ xpToast: { ...state.xpToast, visible: false } })),
  showLevelUp: (level, title) =>
    set({ levelUp: { visible: true, level, title } }),
  hideLevelUp: () =>
    set((state) => ({ levelUp: { ...state.levelUp, visible: false } })),
}))
