"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Loader2, ArrowRight, ArrowUp, ArrowDown, Search, FileText,
  Zap, Users, Bot, Lightbulb, Target, Flame, TrendingUp,
  Megaphone, Eye, Radar, BarChart3, Shield, Swords, BookOpen,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { HealthScoreRing } from "@/components/dashboard/health-score-ring"
import { MissionsPreview } from "@/components/dashboard/missions-preview"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { CopilotPreview } from "@/components/dashboard/copilot-preview"
import { AreaChartCard } from "@/components/charts/area-chart"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
}

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

interface ActionItem {
  id: string
  title: string
  description: string
  howToFix: string
  impact: number
  ease: number
  priority: string
  estimatedTime: string
  category: string
  weekSuggestion: number
}

function DashboardInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const userId = useUserId()

  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [healthScore, setHealthScore] = useState(0)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [actionPlan, setActionPlan] = useState<ActionItem[]>([])
  const [contentCount, setContentCount] = useState(0)
  const [keywordCount, setKeywordCount] = useState(0)
  const [trafficData, setTrafficData] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        // Fetch all data in parallel
        const [userRes, oppRes, actionRes, contentRes, kwRes, healthRes] = await Promise.all([
          fetch(`/api/user?userId=${userId}`).then(r => r.json()).catch(() => null),
          fetch(`/api/opportunities?userId=${userId}`).then(r => r.json()).catch(() => ({ opportunities: [] })),
          fetch(`/api/health-score/action-plan?userId=${userId}`).then(r => r.json()).catch(() => ({ actions: [] })),
          fetch(`/api/content?userId=${userId}`).then(r => r.json()).catch(() => ({ monthlyCount: 0 })),
          fetch(`/api/seo/keywords?userId=${userId}`).then(r => r.json()).catch(() => []),
          fetch(`/api/health-score?userId=${userId}`).then(r => r.json()).catch(() => ({ overallScore: 0 })),
        ])

        if (userRes && !userRes.businessUrl && !userRes.businessNiche) {
          router.push("/setup")
          return
        }

        setUserData(userRes)
        setOpportunities(oppRes.opportunities || [])
        setActionPlan(actionRes.actions || [])
        setContentCount(contentRes.monthlyCount || contentRes.contents?.length || 0)
        setKeywordCount(Array.isArray(kwRes) ? kwRes.length : 0)
        setHealthScore(healthRes.overallScore || healthRes.score || 0)

        // Mock traffic trend (replaced with real GSC data when connected)
        setTrafficData([
          { name: "Sem 1", visitas: 120, impressoes: 3400 },
          { name: "Sem 2", visitas: 185, impressoes: 4100 },
          { name: "Sem 3", visitas: 210, impressoes: 4800 },
          { name: "Sem 4", visitas: 290, impressoes: 5600 },
        ])
      } catch {}
      setLoading(false)
    }
    load()
  }, [userId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  const userName = userData?.name || session?.user?.name || "Usuario"
  const xp = userData?.xp || 0
  const level = userData?.level || 1
  const quickWins = actionPlan.filter(a => a.priority === "quick-win")

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
              Ola, <GradientText as="span">{userName.split(" ")[0]}</GradientText>
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Aqui esta o resumo do seu marketing digital
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400">
              Level {level}
            </span>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
              {xp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Bento Grid Row 1: Stats ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Score Digital", value: healthScore, icon: Shield, color: "text-indigo-500", bg: "bg-indigo-500/10", suffix: "/100" },
          { label: "Keywords Rastreadas", value: keywordCount, icon: Search, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Conteudos Publicados", value: contentCount, icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "XP Total", value: xp, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={stat.value} className="text-2xl font-bold text-slate-900 dark:text-zinc-100" />
              {stat.suffix && <span className="text-sm text-slate-400 dark:text-zinc-500">{stat.suffix}</span>}
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* ── Bento Grid Row 2: Health Score + Opportunities ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health Score Ring */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <GlassCard className="flex flex-col items-center justify-center p-6" hover={false}>
            <HealthScoreRing score={healthScore} size={180} />
            <div className="mt-4 w-full">
              <Link href="/seo" className="flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
                Ver auditoria completa <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Opportunity Radar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="lg:col-span-2">
          <GlassCard className="p-5 h-full" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Radar de Oportunidades</h3>
              </div>
              {opportunities.length > 0 && (
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-500">
                  {opportunities.length} encontradas
                </span>
              )}
            </div>

            {opportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Radar className="h-10 w-10 text-slate-200 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-zinc-400">Nenhuma oportunidade no momento</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {opportunities.slice(0, 4).map((opp) => (
                  <Link key={opp.id} href={opp.actionUrl}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-3 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                      <div className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        opp.impact === "alto" ? "bg-red-500/10 text-red-500" :
                        opp.impact === "medio" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {opp.impactScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">{opp.title}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{opp.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-zinc-600 shrink-0 mt-1" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Bento Grid Row 3: Quick Wins ── */}
      {quickWins.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <GlassCard className="p-5" hover={false}>
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Quick Wins — Acoes rapidas de alto impacto</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickWins.slice(0, 6).map((action) => (
                <div key={action.id} className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{action.title}</span>
                    <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500">{action.estimatedTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 line-clamp-2">{action.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${action.impact * 10}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Impacto {action.impact}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── Bento Grid Row 4: Traffic Chart + Missions ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <AreaChartCard
            data={trafficData}
            dataKey="visitas"
            secondaryKey="impressoes"
            title="Trafego Organico"
            subtitle="Ultimas 4 semanas (conecte GSC para dados reais)"
            color="#6366f1"
            secondaryColor="#a855f7"
            height={220}
          />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
          <MissionsPreview />
        </motion.div>
      </div>

      {/* ── Bento Grid Row 5: Co-Pilot + Activity ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}>
          <CopilotPreview />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}>
          <ActivityFeed />
        </motion.div>
      </div>

      {/* ── Bento Grid Row 6: Quick Links ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "SEO", href: "/seo", icon: Search, color: "from-blue-500 to-cyan-500" },
            { label: "Anuncios", href: "/anuncios", icon: Megaphone, color: "from-violet-500 to-purple-500" },
            { label: "Conteudo", href: "/conteudo", icon: FileText, color: "from-emerald-500 to-green-500" },
            { label: "Concorrentes", href: "/concorrentes", icon: Swords, color: "from-red-500 to-orange-500" },
            { label: "Relatorios", href: "/relatorios", icon: BarChart3, color: "from-indigo-500 to-blue-500" },
            { label: "Academy", href: "/glossario", icon: BookOpen, color: "from-amber-500 to-yellow-500" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <GlassCard className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", item.color)}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{item.label}</span>
                </GlassCard>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
