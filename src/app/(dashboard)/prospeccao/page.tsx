"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Globe, Phone, Star, ExternalLink, MapPin, Zap } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

interface Lead {
  name: string
  address: string
  rating: number
  totalReviews: number
  phone: string | null
  website: string | null
  isOpen: boolean | null
  hasWebsite: boolean
  opportunity: string
}

export default function ProspeccaoPage() {
  const userId = useUserId()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function searchLeads() {
    if (!query.trim() || !userId) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch("/api/prospecting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), location: location.trim(), userId }),
      })
      const data = await res.json()
      setLeads(data.leads || [])
    } catch {}
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Prospeccao de Leads</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Encontre negocios no Google Maps e identifique oportunidades de venda
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tipo de negocio (ex: dentista, restaurante, academia)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchLeads()}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cidade"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50"
              />
            </div>
            <GlowButton onClick={searchLeads} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : searched && leads.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <Globe className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">Nenhum resultado encontrado. Tente outro termo de busca.</p>
        </GlassCard>
      ) : leads.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-zinc-400">{leads.length} leads encontrados</span>
            <span className="text-xs text-indigo-500 font-medium">
              {leads.filter(l => l.opportunity === "alto").length} com alta oportunidade
            </span>
          </div>

          {leads.map((lead, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{lead.name}</h3>
                      <span className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        lead.opportunity === "alto" ? "bg-green-500/10 text-green-500" :
                        lead.opportunity === "medio" ? "bg-amber-500/10 text-amber-500" :
                        "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {lead.opportunity === "alto" ? "Sem site!" : lead.opportunity === "medio" ? "Site fraco" : "Tem site"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-2">{lead.address}</p>
                    <div className="flex items-center gap-4 text-xs">
                      {lead.rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" /> {lead.rating} ({lead.totalReviews})
                        </span>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-indigo-500 hover:underline">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </a>
                      )}
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-indigo-500 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Site
                        </a>
                      )}
                    </div>
                  </div>
                  {lead.opportunity === "alto" && (
                    <div className="shrink-0">
                      <GlowButton size="sm">
                        <Zap className="h-3.5 w-3.5" /> Prospectar
                      </GlowButton>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </div>
  )
}
