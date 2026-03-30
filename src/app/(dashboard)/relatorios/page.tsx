"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText, Download, Eye, Plus, TrendingUp, Users, Search,
  MousePointerClick, BarChart3, Zap, ArrowUp, ArrowDown, Loader2, Radar,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AreaChartCard } from "@/components/charts/area-chart"
import { BarChartCard } from "@/components/charts/bar-chart"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

// Sample data for charts (replaced with real data when APIs are connected)
const trafficData = [
  { name: "Sem 1", clicks: 120, impressions: 3400 },
  { name: "Sem 2", clicks: 185, impressions: 4100 },
  { name: "Sem 3", clicks: 210, impressions: 4800 },
  { name: "Sem 4", clicks: 290, impressions: 5200 },
]

const keywordRankData = [
  { name: "marketing digital", value: 12, color: "#6366f1" },
  { name: "seo para iniciantes", value: 8, color: "#8b5cf6" },
  { name: "trafego pago", value: 15, color: "#a855f7" },
  { name: "google ads", value: 22, color: "#c084fc" },
  { name: "meta ads", value: 18, color: "#818cf8" },
]

const contentPerformance = [
  { name: "Jan", value: 3 },
  { name: "Fev", value: 5 },
  { name: "Mar", value: 8 },
  { name: "Abr", value: 12 },
]

interface Opportunity {
  id: string
  type: string
  title: string
  description: string
  impact: string
  impactScore: number
  actionUrl: string
  category: string
}

export default function RelatoriosPage() {
  const userId = useUserId()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loadingOpp, setLoadingOpp] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Fetch opportunities (Radar)
  useEffect(() => {
    if (!userId) return
    setLoadingOpp(true)
    fetch(`/api/opportunities?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setOpportunities(d.opportunities || []))
      .catch(() => {})
      .finally(() => setLoadingOpp(false))
  }, [userId])

  const handleGenerateReport = async () => {
    if (!userId) return
    setGenerating(true)
    try {
      await fetch("/api/reports/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
    } catch {}
    setGenerating(false)
  }

  const stats = [
    { label: "Cliques (28d)", value: "805", change: "+18%", positive: true, icon: MousePointerClick, color: "text-indigo-500" },
    { label: "Impressoes (28d)", value: "17.5K", change: "+23%", positive: true, icon: Eye, color: "text-violet-500" },
    { label: "Posicao Media", value: "14.2", change: "-2.1", positive: true, icon: Search, color: "text-cyan-500" },
    { label: "CTR Medio", value: "4.6%", change: "+0.8%", positive: true, icon: TrendingUp, color: "text-emerald-500" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
            <GradientText as="span">Relatorios & Analytics</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Dashboard em tempo real com graficos e oportunidades
          </p>
        </div>
        <GlowButton onClick={handleGenerateReport} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {generating ? "Gerando..." : "Gerar Relatorio Semanal"}
        </GlowButton>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("h-4 w-4", stat.color)} />
              <span className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-zinc-100">{stat.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {stat.positive ? (
                <ArrowUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500" />
              )}
              <span className={cn("text-xs font-medium", stat.positive ? "text-emerald-500" : "text-red-500")}>
                {stat.change}
              </span>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <AreaChartCard
          data={trafficData}
          dataKey="clicks"
          secondaryKey="impressions"
          title="Trafego Organico"
          subtitle="Cliques e impressoes das ultimas 4 semanas"
          color="#6366f1"
          secondaryColor="#a855f7"
        />
        <BarChartCard
          data={keywordRankData}
          title="Posicao das Keywords"
          subtitle="Ranking medio no Google (menor = melhor)"
          color="#6366f1"
          valuePrefix="#"
        />
      </motion.div>

      {/* Content + Opportunities Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Content performance */}
        <AreaChartCard
          data={contentPerformance}
          dataKey="value"
          title="Conteudos Publicados"
          subtitle="Evolucao mensal"
          color="#8b5cf6"
          height={200}
        />

        {/* Opportunity Radar */}
        <div className="lg:col-span-2">
          <GlassCard className="p-5" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Radar de Oportunidades
                </h3>
              </div>
              {opportunities.length > 0 && (
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-500">
                  {opportunities.length} encontradas
                </span>
              )}
            </div>

            {loadingOpp ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : opportunities.length === 0 ? (
              <div className="py-8 text-center">
                <Zap className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-zinc-600" />
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Nenhuma oportunidade detectada no momento. Continue usando a plataforma!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.slice(0, 5).map((opp) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      opp.impact === "alto" ? "bg-red-500/10 text-red-500" :
                      opp.impact === "medio" ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {opp.impactScore}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{opp.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">{opp.description}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      opp.impact === "alto" ? "bg-red-500/10 text-red-500" :
                      opp.impact === "medio" ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      {opp.impact}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
