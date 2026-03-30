"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Globe,
  Award,
  Plus,
  Sparkles,
  Info,
  HelpCircle,
  Lightbulb,
  ShoppingBag,
  Briefcase,
  Utensils,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

const stats = [
  { label: "Palavras rastreadas", value: 0, icon: Target, suffix: "", tooltip: "Quantas palavras-chave voce esta monitorando" },
  { label: "No Top 10", value: 0, icon: Award, suffix: "", tooltip: "Palavras que aparecem na primeira pagina do Google" },
  { label: "Trafego organico", value: 0, icon: Globe, suffix: "/mes", tooltip: "Visitantes que chegam pelo Google sem voce pagar" },
  { label: "Score SEO", value: 0, icon: BarChart3, suffix: "/100", tooltip: "Nota geral da saude do SEO do seu site" },
]

type Difficulty = "Facil" | "Medio" | "Dificil"

interface Keyword {
  keyword: string
  position: number
  change: number
  volume: string
  difficulty: Difficulty
}

const keywords: Keyword[] = []

const opportunities: { keyword: string; volume: string; difficulty: Difficulty }[] = []

const difficultyColors: Record<Difficulty, string> = {
  Facil: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Medio: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Dificil: "bg-red-500/20 text-red-400 border-red-500/30",
}

const difficultyExplanation: Record<Difficulty, string> = {
  Facil: "Mais facil de aparecer nos primeiros resultados",
  Medio: "Dificuldade moderada — precisa de bom conteudo",
  Dificil: "Muita competicao — exige estrategia forte",
}

const nicheExamples = [
  { icon: ShoppingBag, niche: "Loja Online", examples: ["camiseta personalizada", "comprar tenis online", "loja de roupas femininas"] },
  { icon: Briefcase, niche: "Servicos", examples: ["advogado trabalhista SP", "contabilidade para MEI", "dentista zona sul"] },
  { icon: Utensils, niche: "Alimentacao", examples: ["bolo de aniversario", "marmita fitness", "delivery de pizza"] },
]

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-xl"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-white border-r border-b border-slate-200" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

function SEOPageInner() {
  const searchParams = useSearchParams()
  const acao = searchParams.get("acao")
  const userId = useUserId()

  const [newKeyword, setNewKeyword] = useState("")
  const [showAddInput, setShowAddInput] = useState(acao === "keywords")
  const showEmptyState = keywords.length === 0
  const [tipsKeyword, setTipsKeyword] = useState<string | null>(null)

  // Audit state
  const [auditUrl, setAuditUrl] = useState("")
  const [auditing, setAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [showAudit, setShowAudit] = useState(acao === "audit")

  async function runAudit() {
    if (!auditUrl.trim()) return
    setAuditing(true)
    try {
      const res = await fetch("/api/seo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId || "demo", url: auditUrl }),
      })
      const data = await res.json()
      setAuditResult(data)
    } catch {
      setAuditResult({ error: true })
    }
    setAuditing(false)
  }

  const severityColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    info: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText>SEO Inteligente</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitore e melhore sua presenca no Google
        </p>
      </motion.div>

      {/* Beginner-friendly SEO explanation banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <GlassCard className="p-5" hover={false} glow glowColor="rgba(99, 102, 241, 0.08)">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <Info className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                O que eh SEO?
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                SEO eh o que faz seu site aparecer no Google quando alguem busca algo.
                Quanto melhor seu SEO, mais pessoas encontram voce{" "}
                <span className="text-emerald-400 font-medium">de graca</span>{" "}
                (sem pagar por anuncios). Aqui voce monitora as palavras que seus clientes
                buscam e ve como seu site esta se saindo.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Audit Section */}
      {(showAudit || acao === "audit") && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <GlassCard className="p-6" hover={false} glow glowColor="rgba(99, 102, 241, 0.1)">
            {/* Audit banner */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <Globe className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Vamos verificar seu site!
                </h3>
                <p className="text-xs text-slate-500">
                  Cole a URL do seu site abaixo para rodar uma auditoria completa.
                </p>
              </div>
            </div>

            {/* Audit form */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                placeholder="https://www.seusite.com.br"
                disabled={auditing}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-violet-500/50 focus:bg-slate-100 disabled:opacity-50"
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
              />
              <GlowButton
                size="sm"
                disabled={!auditUrl.trim() || auditing}
                onClick={runAudit}
              >
                {auditing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Auditar Meu Site
              </GlowButton>
            </div>

            {/* Audit loading state */}
            {auditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-violet-600 py-4"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando seu site... isso pode levar alguns segundos.
              </motion.div>
            )}

            {/* Audit error */}
            {auditResult?.error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <XCircle className="h-4 w-4" />
                  Erro ao auditar o site. Verifique a URL e tente novamente.
                </div>
              </motion.div>
            )}

            {/* Audit results */}
            {auditResult && !auditResult.error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Score */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className={cn("text-5xl font-bold", scoreColor(auditResult.score ?? 0))}>
                    {auditResult.score ?? 0}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Score SEO</p>
                    <p className="text-xs text-slate-500">
                      {(auditResult.score ?? 0) >= 80
                        ? "Otimo! Seu site esta bem otimizado."
                        : (auditResult.score ?? 0) >= 50
                        ? "Razoavel. Ha melhorias importantes a fazer."
                        : "Precisa de atencao. Veja os problemas abaixo."}
                    </p>
                  </div>
                </div>

                {/* Issues list */}
                {auditResult.issues && auditResult.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Problemas encontrados ({auditResult.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {auditResult.issues.map((issue: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          {issue.severity === "high" ? (
                            <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                          ) : issue.severity === "medium" ? (
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                          ) : (
                            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900">{issue.message || issue.title}</p>
                            {issue.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{issue.description}</p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "shrink-0 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              severityColors[issue.severity] || severityColors.info
                            )}
                          >
                            {issue.severity === "high"
                              ? "Alto"
                              : issue.severity === "medium"
                              ? "Medio"
                              : "Baixo"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={i}
          >
            <GlassCard className="p-5" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                    {stat.label}
                    <Tooltip text={stat.tooltip} />
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                  <stat.icon className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Keywords Table */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={4}
      >
        <GlassCard className="p-6" hover={false}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Suas Palavras-Chave
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Palavras que seus clientes buscam no Google e que voce esta acompanhando
              </p>
            </div>
            <GlowButton size="sm" onClick={() => setShowAddInput(!showAddInput)}>
              <Plus className="h-4 w-4" />
              Monitorar Nova Palavra
            </GlowButton>
          </div>

          {/* Inline add keyword input */}
          <AnimatePresence>
            {showAddInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <p className="text-xs text-slate-500 mb-3">
                    <Lightbulb className="inline h-3.5 w-3.5 text-amber-400 mr-1" />
                    Digite uma palavra que seus clientes buscam no Google.
                    Ex: se voce vende bolos, digite &quot;bolo de aniversario&quot;
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="ex: marketing digital, bolo caseiro, advogado SP..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-violet-500/50 focus:bg-slate-100"
                    />
                    <GlowButton
                      size="sm"
                      disabled={!newKeyword.trim()}
                      onClick={() => {
                        // placeholder for add keyword logic
                        setNewKeyword("")
                        setShowAddInput(false)
                      }}
                    >
                      <Search className="h-4 w-4" />
                      Monitorar
                    </GlowButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {showEmptyState ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <Search className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                Voce ainda nao esta monitorando nenhuma palavra-chave
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                Comece adicionando palavras que seus clientes buscam no Google.
                Veja alguns exemplos por nicho:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                {nicheExamples.map((niche) => (
                  <div
                    key={niche.niche}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <niche.icon className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-medium text-slate-900">{niche.niche}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {niche.examples.map((ex) => (
                        <li key={ex} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-violet-500/50" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <GlowButton
                size="lg"
                onClick={() => setShowAddInput(true)}
              >
                <Plus className="h-5 w-5" />
                Adicionar Primeira Palavra
              </GlowButton>
            </motion.div>
          ) : (
            /* Keywords table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-left font-medium text-slate-500">
                      Palavra-chave
                    </th>
                    <th className="pb-3 text-center font-medium text-slate-500">
                      <span className="inline-flex items-center">
                        Posicao no Google
                        <Tooltip text="Em que lugar seu site aparece quando alguem busca essa palavra. Quanto menor o numero, melhor!" />
                      </span>
                    </th>
                    <th className="pb-3 text-center font-medium text-slate-500">
                      Mudanca
                    </th>
                    <th className="pb-3 text-center font-medium text-slate-500">
                      <span className="inline-flex items-center">
                        Buscas/mes
                        <Tooltip text="Quantas vezes por mes as pessoas buscam isso no Google. Mais buscas = mais potencial de visitantes." />
                      </span>
                    </th>
                    <th className="pb-3 text-center font-medium text-slate-500">
                      <span className="inline-flex items-center">
                        Concorrencia
                        <Tooltip text="Quao dificil eh aparecer nos primeiros resultados para essa palavra. 'Facil' significa menos concorrentes." />
                      </span>
                    </th>
                    <th className="pb-3 text-center font-medium text-slate-500">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, i) => (
                    <motion.tr
                      key={kw.keyword}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.35 }}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {kw.keyword}
                      </td>
                      <td className="py-3 text-center">
                        <span className={cn(
                          "font-semibold",
                          kw.position <= 10 ? "text-emerald-400" : kw.position <= 20 ? "text-amber-400" : "text-slate-600"
                        )}>
                          #{kw.position}
                        </span>
                        {kw.position <= 10 && (
                          <span className="ml-1.5 text-[10px] text-emerald-500">Pagina 1</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-sm font-medium",
                            kw.change > 0 ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {kw.change > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {Math.abs(kw.change)}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-600">
                        {kw.volume}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={cn(
                            "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            difficultyColors[kw.difficulty]
                          )}
                          title={difficultyExplanation[kw.difficulty]}
                        >
                          {kw.difficulty}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setTipsKeyword(tipsKeyword === kw.keyword ? null : kw.keyword)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                            tipsKeyword === kw.keyword
                              ? "bg-violet-500/20 text-violet-300"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Lightbulb className="h-3 w-3" />
                          Ver dicas
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Tips panel */}
              <AnimatePresence>
                {tipsKeyword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                        <h4 className="text-sm font-semibold text-slate-900">
                          Dicas para &quot;{tipsKeyword}&quot;
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span>Crie um artigo completo sobre esse tema no seu blog — o Google adora conteudo detalhado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span>Use essa palavra no titulo, no primeiro paragrafo e em pelo menos um subtitulo (H2)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span>Adicione imagens com texto alternativo (alt) contendo a palavra-chave</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          <span>Consiga links de outros sites apontando para sua pagina — isso mostra ao Google que seu conteudo eh confiavel</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={5}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Palavras que voce deveria monitorar
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Encontramos essas palavras que seus clientes podem estar buscando.
              Adicione ao monitoramento para acompanhar sua posicao no Google.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {opportunities.map((opp, i) => (
                <motion.div
                  key={opp.keyword}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.35 }}
                >
                  <GlassCard
                    className="p-4 border-dashed border-violet-500/20"
                    glow
                    glowColor="rgba(139, 92, 246, 0.08)"
                  >
                    <p className="font-medium text-slate-900 text-sm mb-3">
                      {opp.keyword}
                    </p>
                    <div className="flex items-center gap-3 mb-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        {opp.volume} buscas/mes
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 font-medium",
                          difficultyColors[opp.difficulty]
                        )}
                      >
                        {opp.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">
                      {difficultyExplanation[opp.difficulty]}
                    </p>
                    <GlowButton size="sm" variant="secondary" className="w-full">
                      <Plus className="h-3.5 w-3.5" />
                      Comecar a Monitorar
                    </GlowButton>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

export default function SEOPage() {
  return <Suspense><SEOPageInner /></Suspense>
}
