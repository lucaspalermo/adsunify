"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3, Loader2, ExternalLink, TrendingUp, TrendingDown, DollarSign,
  MousePointerClick, Eye, Target, AlertTriangle, Zap, ArrowRight, RefreshCw,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AreaChartCard } from "@/components/charts/area-chart"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Campaign {
  campaignName: string
  status: string
  spend: number
  clicks: number
  impressions: number
  conversions: number
  cpc: number | null
  ctr: number | null
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
}

export default function MonitoramentoPage() {
  const userId = useUserId()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/ads/accounts?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const accs = Array.isArray(data) ? data : data.accounts || []
        setAccounts(accs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  async function syncCampaigns() {
    if (!userId) return
    setSyncing(true)
    try {
      const res = await fetch("/api/ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch {}
    setSyncing(false)
  }

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Monitoramento</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Acompanhe seus anuncios e veja o que precisa mudar pra ter mais resultado
        </p>
      </motion.div>

      {/* Conectar Google Ads */}
      {accounts.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <GlassCard className="p-8 text-center" hover={false}>
            <BarChart3 className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">Conecte seu Google Ads</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2 max-w-md mx-auto">
              Pra ver como estao seus anuncios, voce precisa conectar sua conta do Google Ads. Se voce ainda nao tem, a gente te ajuda a criar.
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mb-6">
              Nao se preocupe — a gente so le os dados, nao mexe em nada.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={`/api/oauth/google-ads/connect?userId=${userId}`}>
                <GlowButton>
                  <ExternalLink className="h-4 w-4" /> Conectar meu Google Ads
                </GlowButton>
              </Link>
              <Link href="/anuncios">
                <GlowButton variant="secondary">
                  Ainda nao tenho — quero criar meu primeiro anuncio
                </GlowButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <>
          {/* Contas conectadas */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Contas Conectadas</h3>
                <GlowButton size="sm" onClick={syncCampaigns} disabled={syncing}>
                  {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Atualizar dados
                </GlowButton>
              </div>
              {accounts.map((acc: any) => (
                <div key={acc.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{acc.accountName || acc.platform}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{acc.platform} — ID: {acc.accountId}</p>
                  </div>
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-500">Conectado</span>
                </div>
              ))}
            </GlassCard>
          </motion.div>

          {/* Stats */}
          {campaigns.length > 0 && (
            <>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Gasto total", value: `R$${totalSpend.toFixed(2)}`, icon: DollarSign, color: "text-red-500" },
                  { label: "Cliques", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-blue-500" },
                  { label: "Visualizacoes", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-violet-500" },
                  { label: "Conversoes", value: totalConversions.toLocaleString(), icon: Target, color: "text-green-500" },
                ].map(stat => (
                  <GlassCard key={stat.label} className="p-4">
                    <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                    <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</p>
                  </GlassCard>
                ))}
              </motion.div>

              {/* Campanhas */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
                <GlassCard className="p-5" hover={false}>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">Suas Campanhas</h3>
                  <div className="space-y-2">
                    {campaigns.map((c, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">{c.campaignName}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span>R${c.spend.toFixed(2)}</span>
                            <span>{c.clicks} cliques</span>
                            <span>{c.conversions} conv.</span>
                            {c.cpc && <span>CPC: R${c.cpc.toFixed(2)}</span>}
                          </div>
                        </div>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                          c.status === "ENABLED" ? "bg-green-500/10 text-green-500" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                        )}>
                          {c.status === "ENABLED" ? "Ativo" : c.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sugestoes IA */}
                  <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-500">Sugestoes da IA</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-300">
                      Conecte suas campanhas e a IA vai analisar diariamente se voce precisa trocar algum anuncio, adicionar palavras negativas, ou ajustar o orcamento pra ter mais resultado.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </>
      )}
    </div>
  )
}
