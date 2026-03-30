"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calculator, MousePointerClick, Users, DollarSign, TrendingUp,
  ChevronDown, AlertTriangle, Loader2, PieChart, Wallet, ArrowUp, ArrowDown,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AreaChartCard } from "@/components/charts/area-chart"
import { BarChartCard } from "@/components/charts/bar-chart"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.1 },
  }),
}

interface Forecast { month: string; predicted: number; optimistic: number; pessimistic: number }
interface Allocation { channel: string; currentSpend: number; recommendedSpend: number; expectedROAS: number; reason: string }
interface Attribution { channel: string; conversions: number; spend: number; percentage: number }

export default function PrevisaoPage() {
  const userId = useUserId()
  const [loading, setLoading] = useState(false)
  const [forecast, setForecast] = useState<Forecast[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [attribution, setAttribution] = useState<Attribution[]>([])
  const [healthTrend, setHealthTrend] = useState<{ date: string; score: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  async function loadForecast() {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/forecast?userId=${userId}&type=all`)
      const data = await res.json()
      setForecast(data.forecast || [])
      setAllocations(data.allocations || [])
      setHealthTrend(data.trend || [])
      const attr = data.attribution?.channels || []
      setAttribution(attr)
      setLoaded(true)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    if (userId) loadForecast()
  }, [userId])

  const forecastChartData = forecast.map(f => ({
    name: f.month,
    estimado: f.predicted,
    otimista: f.optimistic,
    pessimista: f.pessimistic,
  }))

  const healthChartData = healthTrend.map(h => ({
    name: h.date.slice(5), // MM-DD
    score: h.score,
  }))

  const attrChartData = attribution.map(a => ({
    name: a.channel === "GOOGLE_ADS" ? "Google Ads" :
          a.channel === "META_ADS" ? "Meta Ads" :
          a.channel === "ORGANIC" ? "Organico" : a.channel,
    value: a.conversions,
    color: a.channel === "GOOGLE_ADS" ? "#6366f1" :
           a.channel === "META_ADS" ? "#8b5cf6" : "#22c55e",
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Analytics Preditivo</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Previsao de receita, otimizacao de budget e atribuicao de conversoes
        </p>
      </motion.div>

      {loading && !loaded ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* Revenue Forecast Chart */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            {forecastChartData.length > 0 ? (
              <AreaChartCard
                data={forecastChartData}
                dataKey="estimado"
                secondaryKey="otimista"
                title="Previsao de Receita — Proximos 6 meses"
                subtitle="Baseado no crescimento atual e performance de campanhas"
                color="#6366f1"
                secondaryColor="#22c55e"
                valuePrefix="R$"
                height={280}
              />
            ) : (
              <GlassCard className="p-8 text-center" hover={false}>
                <TrendingUp className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">Sem dados suficientes</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Continue usando a plataforma para gerar previsoes de receita</p>
              </GlassCard>
            )}
          </motion.div>

          {/* Budget Optimizer */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <GlassCard className="p-5" hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Budget Optimizer</h3>
              </div>
              {allocations.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 py-4 text-center">Conecte suas contas de anuncio para receber recomendacoes</p>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc, i) => {
                    const diff = alloc.recommendedSpend - alloc.currentSpend
                    const isUp = diff > 0
                    return (
                      <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                            {alloc.channel === "GOOGLE_ADS" ? "Google Ads" :
                             alloc.channel === "META_ADS" ? "Meta Ads" :
                             alloc.channel === "SEO_ORGANIC" ? "SEO Organico" : alloc.channel}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{alloc.reason}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            R${alloc.recommendedSpend.toLocaleString("pt-BR")}
                          </p>
                          {diff !== 0 && (
                            <div className={cn("flex items-center gap-0.5 justify-end text-xs font-medium", isUp ? "text-green-500" : "text-red-500")}>
                              {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              R${Math.abs(diff).toLocaleString("pt-BR")}
                            </div>
                          )}
                        </div>
                        {alloc.expectedROAS > 0 && (
                          <div className="shrink-0 rounded-lg bg-indigo-500/10 px-2.5 py-1">
                            <span className="text-xs font-bold text-indigo-500">{alloc.expectedROAS}x ROAS</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Row: Attribution + Health Trend */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              {attrChartData.length > 0 ? (
                <BarChartCard
                  data={attrChartData}
                  title="Atribuicao de Conversoes"
                  subtitle="Conversoes por canal"
                  color="#6366f1"
                  height={220}
                />
              ) : (
                <GlassCard className="flex flex-col items-center justify-center p-8" hover={false}>
                  <PieChart className="h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Dados de atribuicao aparecem apos conectar contas de anuncio</p>
                </GlassCard>
              )}
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
              {healthChartData.length > 0 ? (
                <AreaChartCard
                  data={healthChartData}
                  dataKey="score"
                  title="Evolucao do Score Digital"
                  subtitle="Historico de saude do marketing"
                  color="#8b5cf6"
                  height={220}
                />
              ) : (
                <GlassCard className="flex flex-col items-center justify-center p-8" hover={false}>
                  <TrendingUp className="h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Score Digital sera rastreado ao longo do tempo</p>
                </GlassCard>
              )}
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Estimativas baseadas em dados historicos e tendencias do setor. Resultados reais podem variar conforme investimento e otimizacao.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
