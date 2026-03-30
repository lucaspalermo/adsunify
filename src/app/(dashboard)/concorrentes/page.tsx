"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  Target,
  Tag,
  Megaphone,
  Copy,
  Swords,
  ShoppingBag,
  Trash2,
  Users,
  Plus,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const, delay: i * 0.1 },
  }),
}

interface WhatToCopy {
  action: string
  howTo: string
  priority: "alta" | "media"
}

interface Analysis {
  competitorName: string
  whatTheySell: string
  strengths: string[]
  weaknesses: string[]
  keywordsTheyUse: string[]
  estimatedTraffic: "baixo" | "medio" | "alto"
  adStrategies: string[]
  whatToCopy: WhatToCopy[]
  howToBeatThem: string[]
}

interface CompetitorEntry {
  id: string
  name: string
  domain: string
  analysis: Analysis | null
}

const loadingSteps = [
  "Acessando site...",
  "Analisando com IA...",
  "Pronto!",
]

function CompetitorCard({ comp, onRemove }: { comp: CompetitorEntry; onRemove: (id: string) => void }) {
  const [expandedCopy, setExpandedCopy] = useState(false)
  const a = comp.analysis
  if (!a) return null

  const trafficColor =
    a.estimatedTraffic === "alto"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : a.estimatedTraffic === "medio"
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-slate-600 bg-slate-50 border-slate-200"

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
      <GlassCard className="p-6 space-y-5" hover={false}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Globe className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{a.competitorName || comp.name}</h3>
              <p className="text-xs text-slate-500">{comp.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", trafficColor)}>
              Trafego: {a.estimatedTraffic}
            </span>
            <button onClick={() => onRemove(comp.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* What they sell */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            O que eles vendem
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{a.whatTheySell}</p>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-50/50 border border-emerald-200/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-3">
              <Shield className="h-3.5 w-3.5" />
              Pontos fortes
            </div>
            <ul className="space-y-2">
              {a.strengths.map((s, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-red-50/50 border border-red-200/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wider mb-3">
              <Target className="h-3.5 w-3.5" />
              Pontos fracos
            </div>
            <ul className="space-y-2">
              {a.weaknesses.map((w, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  {w}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Tag className="h-3.5 w-3.5" />
            Palavras-chave que usam
          </div>
          <div className="flex flex-wrap gap-2">
            {a.keywordsTheyUse.map((kw, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.04 }} className="inline-flex items-center rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-medium text-violet-700">
                {kw}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Ad Strategies */}
        <div className="rounded-xl bg-blue-50/50 border border-blue-200/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
            <Megaphone className="h-3.5 w-3.5" />
            Estrategias de anuncio
          </div>
          <ul className="space-y-2">
            {a.adStrategies.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* What to copy */}
        <div>
          <button onClick={() => setExpandedCopy(!expandedCopy)} className="flex items-center gap-2 w-full text-left">
            <Copy className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">O que copiar/adaptar</span>
            <span className="text-xs text-slate-400 ml-1">({a.whatToCopy.length})</span>
            {expandedCopy ? <ChevronUp className="h-4 w-4 text-slate-400 ml-auto" /> : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto" />}
          </button>
          <AnimatePresence>
            {expandedCopy && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {a.whatToCopy.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl bg-violet-50/50 border border-violet-200/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", item.priority === "alta" ? "bg-red-100 text-red-700 border border-red-200" : "bg-amber-100 text-amber-700 border border-amber-200")}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.howTo}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* How to beat them */}
        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider mb-3">
            <Swords className="h-3.5 w-3.5" />
            Como superar esse concorrente
          </div>
          <ul className="space-y-2">
            {a.howToBeatThem.map((tip, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 text-violet-500 font-bold text-xs">{i + 1}.</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function ConcorrentesContent() {
  const userId = useUserId()
  const [domain, setDomain] = useState("")
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing competitors on mount
  useEffect(() => {
    if (!userId) return
    fetch(`/api/competitors?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: CompetitorEntry[] = data.map((c: any) => ({
            id: c.id,
            name: c.name || c.domain,
            domain: c.domain,
            analysis: c.snapshots?.[0]?.techStack || c.analysis || null,
          }))
          setCompetitors(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false))
  }, [userId])

  const analyzeCompetitor = async () => {
    if (!domain.trim() || !userId) return
    setError(null)
    setLoading(true)
    setLoadingStep(0)

    const stepTimer1 = setTimeout(() => setLoadingStep(1), 2000)
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 5000)

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), userId }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Erro ao analisar concorrente")
      }

      const data = await res.json()
      const entry: CompetitorEntry = {
        id: data.competitor?.id || crypto.randomUUID(),
        name: data.competitor?.name || data.analysis?.competitorName || domain.trim(),
        domain: data.competitor?.domain || domain.trim(),
        analysis: data.analysis || null,
      }

      setCompetitors((prev) => [entry, ...prev])
      setDomain("")
      setLoadingStep(2)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      setTimeout(() => setLoading(false), 600)
    }
  }

  const removeCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText>Espiao de Concorrentes</GradientText>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-lg">
          Cole o site de um concorrente e descubra o que ele faz, o que funciona, e como superar
        </p>
      </motion.div>

      {/* Add Competitor */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <GlassCard className="p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cole o site do concorrente (ex: concorrente.com.br)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && analyzeCompetitor()}
                disabled={loading}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors disabled:opacity-50"
              />
            </div>
            <GlowButton onClick={analyzeCompetitor} disabled={loading || !domain.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Analisar Concorrente
            </GlowButton>
          </div>

          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-200/60 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600 shrink-0" />
                  <div className="flex items-center gap-4">
                    {loadingSteps.map((step, i) => (
                      <span key={i} className={cn("text-sm transition-colors duration-300", i <= loadingStep ? "text-violet-700 font-medium" : "text-slate-400")}>
                        {i < loadingStep && <span className="text-emerald-500 mr-1">&#10003;</span>}
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      {/* Results */}
      {initialLoading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </motion.div>
      ) : competitors.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <GlassCard className="p-6" hover={false}>
            <div className="py-12 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <Users className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">Nenhum concorrente analisado</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Adicione seu primeiro concorrente para descobrir o que ele faz e como superar
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {competitors.map((comp) => (
            <CompetitorCard key={comp.id} comp={comp} onRemove={removeCompetitor} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ConcorrentesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    }>
      <ConcorrentesContent />
    </Suspense>
  )
}
