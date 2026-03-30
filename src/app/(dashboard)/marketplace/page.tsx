"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Star, Clock, Loader2, Search, User } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  title: string
  description: string
  category: string
  priceMin: number
  priceMax: number | null
  deliveryDays: number
  rating: number
  reviewCount: number
  provider: { name: string; level: number }
}

const categories = ["Todos", "Design", "Video", "Desenvolvimento", "Copywriting", "SEO", "Trafego Pago"]

export default function MarketplacePage() {
  const userId = useUserId()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: "1", limit: "20" })
    if (category !== "Todos") params.set("category", category.toLowerCase())
    fetch(`/api/marketplace/services?${params}`)
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category])

  const filtered = searchQuery
    ? services.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : services

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Marketplace</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Contrate profissionais especializados em marketing digital
        </p>
      </motion.div>

      {/* Search + Categories */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar servicos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            category === cat ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          )}>{cat}</button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">Nenhum servico disponivel</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Novos profissionais estao sendo adicionados ao marketplace</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service, i) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-500 uppercase">{service.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-slate-500">{service.rating} ({service.reviewCount})</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">{service.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex-1 line-clamp-2">{service.description}</p>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">R${service.priceMin}</span>
                    {service.priceMax && <span className="text-xs text-slate-400"> - R${service.priceMax}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" /> {service.deliveryDays} dias
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <User className="h-3 w-3" /> {service.provider?.name || "Profissional"}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
