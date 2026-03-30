"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Loader2, Globe, Search, Megaphone, BarChart3, ArrowRight, CheckCircle2,
  XCircle, AlertTriangle, TrendingUp, Eye, Zap, Bot, ExternalLink,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
}

function DashboardInner() {
  const { data: session } = useSession()
  const router = useRouter()
  const userId = useUserId()

  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [sites, setSites] = useState<any[]>([])
  const [auditScore, setAuditScore] = useState<number | null>(null)
  const [auditIssues, setAuditIssues] = useState<any[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [hasAdsConnected, setHasAdsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const [userRes, sitesRes] = await Promise.all([
          fetch(`/api/user?userId=${userId}`).then(r => r.json()).catch(() => null),
          fetch(`/api/sites?userId=${userId}`).then(r => r.json()).catch(() => []),
        ])

        if (userRes && !userRes.businessUrl && !userRes.businessNiche) {
          router.push("/onboarding")
          return
        }

        setUserData(userRes)
        setSites(Array.isArray(sitesRes) ? sitesRes : [])

        // Check if has Google Ads connected
        fetch(`/api/ads/accounts?userId=${userId}`)
          .then(r => r.json())
          .then(d => setHasAdsConnected(Array.isArray(d) ? d.length > 0 : false))
          .catch(() => {})

        // Auto-run audit on main site
        if (userRes?.businessUrl && userId) {
          runAudit(userId, userRes.businessUrl)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [userId, router])

  async function runAudit(uid: string, url: string) {
    setAuditLoading(true)
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, url: fullUrl }),
      })
      const data = await res.json()
      if (data.score !== undefined) {
        setAuditScore(data.score)
        setAuditIssues(data.issues || [])
      }
    } catch {}
    setAuditLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  }

  const userName = userData?.name || session?.user?.name || "Usuario"
  const siteUrl = userData?.businessUrl || ""
  const okCount = auditIssues.filter((i: any) => i.severity === "ok").length
  const problemCount = auditIssues.filter((i: any) => i.severity !== "ok").length

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          Ola, <GradientText as="span">{userName.split(" ")[0]}</GradientText>!
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Aqui esta o resumo do seu negocio. Escolha o que voce quer fazer.
        </p>
      </motion.div>

      {/* Dois caminhos principais */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="grid gap-4 sm:grid-cols-2">
        {/* Caminho A: Criar Anuncio */}
        <Link href="/anuncios">
          <motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
            <GlassCard className="p-6 h-full border-2 border-transparent hover:border-indigo-500/30 transition-colors" glow>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">Quero criar um anuncio</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">
                A IA cria o anuncio perfeito pro seu negocio e te guia passo a passo pra publicar
              </p>
              <span className="flex items-center gap-1 text-sm font-medium text-indigo-500">
                Comecar <ArrowRight className="h-4 w-4" />
              </span>
            </GlassCard>
          </motion.div>
        </Link>

        {/* Caminho B: Verificar Site */}
        <Link href="/seo">
          <motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
            <GlassCard className="p-6 h-full border-2 border-transparent hover:border-cyan-500/30 transition-colors" glow>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">Quero verificar meu site</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">
                Veja o que falta no seu site pra aparecer no Google e ter mais visitantes
              </p>
              <span className="flex items-center gap-1 text-sm font-medium text-cyan-500">
                Verificar <ArrowRight className="h-4 w-4" />
              </span>
            </GlassCard>
          </motion.div>
        </Link>
      </motion.div>

      {/* Diagnostico do site (se tem URL) */}
      {siteUrl && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Diagnostico: {siteUrl}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Analise automatica do seu site</p>
                </div>
              </div>
              {auditLoading ? (
                <span className="flex items-center gap-1.5 text-xs text-indigo-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analisando...
                </span>
              ) : auditScore !== null ? (
                <div className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold",
                  auditScore >= 80 ? "bg-green-500/10 text-green-500" :
                  auditScore >= 50 ? "bg-amber-500/10 text-amber-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  <AnimatedCounter value={auditScore} className="inline" />/100
                </div>
              ) : null}
            </div>

            {auditScore !== null && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 text-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-500">{okCount}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Tudo certo</p>
                  </div>
                  <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3 text-center">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-500">{problemCount}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Precisa arrumar</p>
                  </div>
                </div>

                {/* Top 3 problemas */}
                {problemCount > 0 && (
                  <div className="space-y-2 mb-3">
                    {auditIssues.filter((i: any) => i.severity !== "ok").slice(0, 3).map((issue: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 rounded-lg border border-red-500/10 bg-red-500/5 p-2.5">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-zinc-100">{issue.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{issue.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/seo">
                  <GlowButton variant="secondary" size="sm" className="w-full">
                    Ver analise completa e como arrumar <ArrowRight className="h-3.5 w-3.5" />
                  </GlowButton>
                </Link>
              </>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Status dos anuncios */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Seus Anuncios</h3>
          </div>

          {hasAdsConnected ? (
            <div>
              <p className="text-sm text-green-500 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Google Ads conectado
              </p>
              <Link href="/monitoramento">
                <GlowButton size="sm">
                  <Eye className="h-4 w-4" /> Ver como estao seus anuncios
                </GlowButton>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">
                Voce ainda nao tem anuncios conectados. Tem duas opcoes:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/anuncios">
                  <GlowButton size="sm">
                    <Megaphone className="h-4 w-4" /> Criar meu primeiro anuncio
                  </GlowButton>
                </Link>
                <Link href="/monitoramento">
                  <GlowButton size="sm" variant="secondary">
                    <ExternalLink className="h-4 w-4" /> Ja tenho anuncios — conectar
                  </GlowButton>
                </Link>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Multi-site */}
      {sites.length > 1 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-500" /> Seus Sites ({sites.length})
              </h3>
              <Link href="/meus-sites" className="text-xs text-indigo-500 hover:underline">Gerenciar</Link>
            </div>
            <div className="space-y-2">
              {sites.map((site: any) => (
                <div key={site.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{site.name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{site.url}</p>
                  </div>
                  {site.lastScore !== null && site.lastScore !== undefined && (
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold",
                      site.lastScore >= 70 ? "bg-green-500/10 text-green-500" :
                      site.lastScore >= 40 ? "bg-amber-500/10 text-amber-500" :
                      "bg-red-500/10 text-red-500"
                    )}>{site.lastScore}</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Co-Piloto */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
        <Link href="/copilot">
          <GlassCard className="p-5 border-2 border-transparent hover:border-violet-500/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Tem alguma duvida?</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Pergunte qualquer coisa pro Co-Piloto IA — ele te ajuda com tudo</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          </GlassCard>
        </Link>
      </motion.div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <DashboardInner />
    </Suspense>
  )
}
