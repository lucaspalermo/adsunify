"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, Plus, Loader2, Trash2, Search, CheckCircle2, XCircle, Star } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useSiteStore } from "@/stores/site-store"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

export default function MeusSitesPage() {
  const userId = useUserId()
  const { sites, setSites, setActiveSite } = useSiteStore()
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState("")
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [auditing, setAuditing] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/sites?userId=${userId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSites(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, setSites])

  async function addSite() {
    if (!newUrl.trim() || !userId) return
    setAdding(true)
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url: newUrl.trim(), name: newName.trim() || newUrl.trim() }),
      })
      const site = await res.json()
      if (site.id) {
        setSites([...sites, site])
        setNewUrl("")
        setNewName("")
      }
    } catch {}
    setAdding(false)
  }

  async function removeSite(siteId: string) {
    await fetch(`/api/sites?siteId=${siteId}`, { method: "DELETE" })
    setSites(sites.filter(s => s.id !== siteId))
  }

  async function auditSite(siteId: string, url: string) {
    setAuditing(siteId)
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url: fullUrl }),
      })
      const data = await res.json()
      if (data.score !== undefined) {
        // Update site score
        await fetch("/api/sites", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId, lastScore: data.score }),
        }).catch(() => {})
        setSites(sites.map(s => s.id === siteId ? { ...s, lastScore: data.score } : s))
      }
    } catch {}
    setAuditing(null)
  }

  async function setPrimary(siteId: string) {
    await fetch("/api/sites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, userId, action: "set-primary" }),
    })
    setSites(sites.map(s => ({ ...s, isPrimary: s.id === siteId })))
    setActiveSite(siteId)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Meus Sites</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Adicione todos os seus sites, instagrams ou tiktoks pra monitorar tudo num lugar so
        </p>
      </motion.div>

      {/* Adicionar */}
      <GlassCard className="p-5" hover={false}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">Adicionar novo</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="text" placeholder="URL, @ do Instagram ou TikTok" value={newUrl} onChange={e => setNewUrl(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
          <input type="text" placeholder="Nome (opcional)" value={newName} onChange={e => setNewName(e.target.value)}
            className="h-11 sm:w-40 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
          <GlowButton onClick={addSite} disabled={adding || !newUrl.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </GlowButton>
        </div>
      </GlassCard>

      {/* Lista */}
      {sites.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <Globe className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">Nenhum site adicionado ainda</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {sites.map((site, i) => (
            <motion.div key={site.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className={cn("p-4", site.isPrimary && "ring-1 ring-indigo-500/20")} hover={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Globe className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">{site.name}</p>
                        {site.isPrimary && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-500">PRINCIPAL</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{site.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Score */}
                    {site.lastScore !== null && site.lastScore !== undefined ? (
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold",
                        (site.lastScore ?? 0) >= 70 ? "bg-green-500/10 text-green-500" :
                        (site.lastScore ?? 0) >= 40 ? "bg-amber-500/10 text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      )}>{site.lastScore}/100</span>
                    ) : null}

                    {/* Actions */}
                    <GlowButton size="sm" variant="secondary" onClick={() => auditSite(site.id, site.url)} disabled={auditing === site.id}>
                      {auditing === site.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                      Analisar
                    </GlowButton>

                    {!site.isPrimary && (
                      <button onClick={() => setPrimary(site.id)} className="rounded-lg border border-slate-200 dark:border-zinc-700 px-2 py-1.5 text-[10px] font-medium text-slate-500 hover:text-indigo-500 hover:border-indigo-500/30 transition-colors">
                        <Star className="h-3 w-3" />
                      </button>
                    )}

                    <button onClick={() => removeSite(site.id)} className="rounded-lg border border-slate-200 dark:border-zinc-700 px-2 py-1.5 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
