"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Globe, Loader2, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, Zap, Clock, ChevronDown, ChevronUp, Lightbulb, TrendingUp, Star,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { useSiteStore } from "@/stores/site-store"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.1 } }),
}

interface AuditIssue { type: string; severity: string; title: string; description: string }
interface ActionItem {
  id: string; title: string; description: string; howToFix: string
  impact: number; ease: number; priority: string; estimatedTime: string
  category: string; weekSuggestion: number
}

function SeoContent() {
  const userId = useUserId()
  const activeSite = useSiteStore((s) => s.getActiveSite())
  const [siteUrl, setSiteUrl] = useState("")
  const [auditLoading, setAuditLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [issues, setIssues] = useState<AuditIssue[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [actionsLoading, setActionsLoading] = useState(false)
  const [expandedAction, setExpandedAction] = useState<string | null>(null)

  useEffect(() => {
    if (activeSite?.url) setSiteUrl(activeSite.url)
  }, [activeSite])

  async function runAudit() {
    if (!siteUrl.trim() || !userId) return
    setAuditLoading(true)
    setScore(null)
    setIssues([])
    setActions([])
    try {
      const fullUrl = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, url: fullUrl }),
      })
      const data = await res.json()
      if (data.score !== undefined) {
        setScore(data.score)
        setIssues(data.issues || [])
        // Carregar plano de acao
        setActionsLoading(true)
        fetch(`/api/health-score/action-plan?userId=${userId}`)
          .then(r => r.json())
          .then(d => setActions(d.actions || []))
          .catch(() => {})
          .finally(() => setActionsLoading(false))
      }
    } catch {}
    setAuditLoading(false)
  }

  // Rodar audit automatico se tem site
  useEffect(() => {
    if (siteUrl && userId && !score && !auditLoading) {
      runAudit()
    }
  }, [siteUrl, userId])

  const okCount = issues.filter(i => i.severity === "ok").length
  const problemCount = issues.filter(i => i.severity !== "ok").length
  const quickWins = actions.filter(a => a.priority === "quick-win")
  const bigProjects = actions.filter(a => a.priority === "big-project")

  const priorityLabels: Record<string, { label: string; color: string; description: string }> = {
    "quick-win": { label: "Rapido e facil", color: "bg-green-500/10 text-green-500", description: "Voce consegue fazer em poucos minutos e o resultado e grande" },
    "big-project": { label: "Projeto maior", color: "bg-amber-500/10 text-amber-500", description: "Leva mais tempo, mas o impacto compensa" },
    "low-priority": { label: "Pode esperar", color: "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400", description: "Faz diferenca, mas nao e urgente" },
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Saude do seu Site</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Descubra o que esta bom e o que precisa melhorar no seu site pra aparecer no Google
        </p>
      </motion.div>

      {/* Site Input */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
        <GlassCard className="p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cole o endereco do seu site (ex: meusite.com.br)"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <GlowButton onClick={runAudit} disabled={auditLoading || !siteUrl.trim()}>
              {auditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {auditLoading ? "Analisando..." : "Verificar meu site"}
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Loading */}
      {auditLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-sm text-slate-500 dark:text-zinc-400">Verificando seu site... isso leva uns 10 segundos</p>
        </motion.div>
      )}

      {/* Score Result */}
      {score !== null && !auditLoading && (
        <>
          {/* Score Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex flex-col items-center sm:flex-row sm:gap-8">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Nota geral do seu site</p>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter value={score} className={cn(
                      "text-5xl font-bold",
                      score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500"
                    )} />
                    <span className="text-xl text-slate-400">/100</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
                    {score >= 80 ? "Otimo! Seu site esta bem preparado. Veja como melhorar ainda mais." :
                     score >= 50 ? "Seu site esta no caminho certo, mas tem coisas importantes pra arrumar." :
                     "Seu site precisa de atencao. Siga o plano abaixo — comece pelo mais facil."}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-4">
                  <div className="text-center rounded-xl bg-green-500/5 border border-green-500/10 px-4 py-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-500">{okCount}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Esta certo</p>
                  </div>
                  <div className="text-center rounded-xl bg-red-500/5 border border-red-500/10 px-4 py-3">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-500">{problemCount}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Pra arrumar</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Problems found */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
            <GlassCard className="p-5" hover={false}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">
                O que encontramos no seu site
              </h3>
              <div className="space-y-2">
                {issues.map((issue, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-3 rounded-xl border p-3",
                    issue.severity === "ok"
                      ? "border-green-500/10 bg-green-500/5"
                      : issue.severity === "critical" || issue.severity === "high"
                        ? "border-red-500/10 bg-red-500/5"
                        : "border-amber-500/10 bg-amber-500/5"
                  )}>
                    {issue.severity === "ok" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    ) : issue.severity === "critical" || issue.severity === "high" ? (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{issue.title}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Plan */}
          {actionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-sm text-slate-500">Montando seu plano de acao...</span>
            </div>
          ) : actions.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
              <GlassCard className="p-5" hover={false}>
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Seu plano de acao — o que fazer primeiro
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                  Organizamos por facilidade e impacto. Comece pelo que esta marcado como &quot;Rapido e facil&quot; — sao coisas que voce resolve em minutos e ja fazem diferenca.
                </p>

                <div className="space-y-3">
                  {actions.map((action) => {
                    const prio = priorityLabels[action.priority] || priorityLabels["low-priority"]
                    const isExpanded = expandedAction === action.id
                    return (
                      <div key={action.id} className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <button
                          onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                          className="flex w-full items-start gap-3 p-4 text-left"
                        >
                          <div className="mt-0.5">
                            {action.priority === "quick-win" ? (
                              <Zap className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{action.title}</span>
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", prio.color)}>
                                {prio.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{action.description}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                              <span>Tempo: {action.estimatedTime}</span>
                              <span>Impacto: {action.impact}/10</span>
                              <span>Semana {action.weekSuggestion}</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 dark:border-zinc-800 px-4 py-3 bg-slate-50 dark:bg-zinc-800/30 rounded-b-xl">
                                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                                  <Star className="h-3 w-3 text-indigo-500" /> Como fazer (passo a passo):
                                </p>
                                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                                  {action.howToFix}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default function SeoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <SeoContent />
    </Suspense>
  )
}
