import { create } from "zustand"

interface Site {
  id: string
  name: string
  url: string
  niche?: string
  isPrimary: boolean
  lastScore?: number
}

interface SiteStore {
  sites: Site[]
  activeSiteId: string | null
  setSites: (sites: Site[]) => void
  setActiveSite: (id: string) => void
  getActiveSite: () => Site | null
}

export const useSiteStore = create<SiteStore>((set, get) => ({
  sites: [],
  activeSiteId: null,
  setSites: (sites) => {
    const primary = sites.find((s) => s.isPrimary) || sites[0]
    set({ sites, activeSiteId: get().activeSiteId || primary?.id || null })
  },
  setActiveSite: (id) => set({ activeSiteId: id }),
  getActiveSite: () => {
    const { sites, activeSiteId } = get()
    return sites.find((s) => s.id === activeSiteId) || sites[0] || null
  },
}))
