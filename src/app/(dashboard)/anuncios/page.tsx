"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Megaphone,
  Plug,
  DollarSign,
  MousePointerClick,
  Target,
  Lightbulb,
  Check,
  ArrowRight,
  ArrowLeft,
  Copy,
  Sparkles,
  Globe,
  Users,
  ImageIcon,
  Type,
  Loader2,
  ChevronRight,
  Wand2,
  BarChart3,
  Zap,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

/* ── Animation helpers ── */
const fadeInInitial = { opacity: 0, y: 20 }
const fadeInAnimate = { opacity: 1, y: 0 }
const fadeInTransition = { duration: 0.4, ease: "easeOut" as const }

/* ═══════════════════════════════════════════════
   AD CREATION WIZARD
   ═══════════════════════════════════════════════ */

type AdPlatform = "google" | "meta"
type AdObjective = "traffic" | "leads" | "sales" | "awareness"

interface WizardData {
  platform: AdPlatform | null
  objective: AdObjective | null
  businessName: string
  businessUrl: string
  product: string
  audience: string
  budget: string
  headlines: string[]
  descriptions: string[]
}

const OBJECTIVES: { id: AdObjective; label: string; desc: string; icon: typeof Target }[] = [
  { id: "traffic", label: "Trafego", desc: "Levar visitantes ao site", icon: Globe },
  { id: "leads", label: "Leads", desc: "Capturar contatos", icon: Users },
  { id: "sales", label: "Vendas", desc: "Vender produtos/servicos", icon: DollarSign },
  { id: "awareness", label: "Reconhecimento", desc: "Aumentar visibilidade", icon: Megaphone },
]

const BUDGETS = [
  { value: "30", label: "R$30/dia", desc: "Ideal para comecar" },
  { value: "50", label: "R$50/dia", desc: "Bom para testes" },
  { value: "100", label: "R$100/dia", desc: "Resultados mais rapidos" },
  { value: "200", label: "R$200+/dia", desc: "Escala agressiva" },
]

function AdWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [data, setData] = useState<WizardData>({
    platform: null,
    objective: null,
    businessName: "",
    businessUrl: "",
    product: "",
    audience: "",
    budget: "",
    headlines: [],
    descriptions: [],
  })

  const totalSteps = 5
  const progress = ((step + 1) / totalSteps) * 100

  const canNext = useCallback(() => {
    switch (step) {
      case 0: return !!data.platform
      case 1: return !!data.objective
      case 2: return data.businessName.trim().length > 0 && data.product.trim().length > 0
      case 3: return !!data.budget
      default: return true
    }
  }, [step, data])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    // Simulated AI generation
    await new Promise((r) => setTimeout(r, 2500))

    const platform = data.platform === "google" ? "Google Ads" : "Meta Ads"
    const obj = OBJECTIVES.find((o) => o.id === data.objective)

    setData((prev) => ({
      ...prev,
      headlines: [
        `${data.product} - ${obj?.label} Garantido`,
        `Descubra ${data.businessName} | Resultados Reais`,
        `${data.product} com Ate 50% OFF Hoje`,
      ],
      descriptions: [
        `${data.businessName} oferece ${data.product.toLowerCase()} para ${data.audience || "voce"}. Comece agora e veja resultados em ${data.objective === "traffic" ? "24h" : "7 dias"}.`,
        `Cansado de resultados mediocres? ${data.businessName} transforma seu investimento em ${obj?.label.toLowerCase()}. Teste gratis por 7 dias.`,
      ],
    }))
    setGenerating(false)
    setStep(4)
  }, [data])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
            Passo {step + 1} de {totalSteps}
          </span>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
            Cancelar
          </button>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Platform */}
        {step === 0 && (
          <motion.div key="step0" initial={fadeInInitial} animate={fadeInAnimate} transition={fadeInTransition} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Onde voce quer anunciar?
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Escolha a plataforma para criar seu anuncio
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "google" as AdPlatform, name: "Google Ads", desc: "Pesquisa, Display, YouTube", color: "from-blue-500/10 to-green-500/10 dark:from-blue-500/20 dark:to-green-500/20" },
                { id: "meta" as AdPlatform, name: "Meta Ads", desc: "Facebook, Instagram, Messenger", color: "from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setData((prev) => ({ ...prev, platform: p.id }))}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-2xl border-2 p-8 text-center transition-all",
                    data.platform === p.id
                      ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600"
                  )}
                >
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br", p.color)}>
                    <Megaphone className="h-7 w-7 text-slate-700 dark:text-zinc-300" />
                  </div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{p.name}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{p.desc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Objective */}
        {step === 1 && (
          <motion.div key="step1" initial={fadeInInitial} animate={fadeInAnimate} transition={fadeInTransition} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Qual seu objetivo?
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                O que voce quer alcançar com esse anuncio?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setData((prev) => ({ ...prev, objective: obj.id }))}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    data.objective === obj.id
                      ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600"
                  )}
                >
                  <obj.icon className="h-5 w-5 shrink-0 text-indigo-500" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-zinc-100">{obj.label}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">{obj.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <motion.div key="step2" initial={fadeInInitial} animate={fadeInAnimate} transition={fadeInTransition} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Sobre seu negocio
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                A IA usa essas infos para criar copys persuasivas
              </p>
            </div>
            <div className="space-y-4">
              {[
                { key: "businessName" as const, label: "Nome do negocio", placeholder: "Ex: Loja da Maria", required: true },
                { key: "businessUrl" as const, label: "URL do site", placeholder: "https://seusite.com.br", required: false },
                { key: "product" as const, label: "Produto/Servico principal", placeholder: "Ex: Roupas femininas plus size", required: true },
                { key: "audience" as const, label: "Publico-alvo", placeholder: "Ex: Mulheres 25-45 anos, classe B/C", required: false },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-zinc-300">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={data[field.key]}
                    onChange={(e) => setData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-sm transition-all",
                      "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
                      "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30",
                      "dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500/50"
                    )}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <motion.div key="step3" initial={fadeInInitial} animate={fadeInAnimate} transition={fadeInTransition} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                Orcamento diario
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Quanto voce pode investir por dia nesta campanha?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setData((prev) => ({ ...prev, budget: b.value }))}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all",
                    data.budget === b.value
                      ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600"
                  )}
                >
                  <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">{b.label}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{b.desc}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
                  <strong className="text-amber-600 dark:text-amber-400">Dica:</strong> Comece com R$30-50/dia nos primeiros 7 dias para testar. Depois otimize e aumente gradualmente com base nos resultados.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Generated Results */}
        {step === 4 && (
          <motion.div key="step4" initial={fadeInInitial} animate={fadeInAnimate} transition={fadeInTransition} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                <Sparkles className="mr-2 inline h-6 w-6 text-indigo-500" />
                Seus anuncios estao prontos!
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Copie os textos abaixo e use na plataforma de anuncios
              </p>
            </div>

            {/* Headlines */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                <Type className="mr-1 inline h-4 w-4" /> Titulos (Headlines)
              </h3>
              <div className="space-y-2">
                {data.headlines.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <span className="flex-1 text-sm text-slate-900 dark:text-zinc-100">{h}</span>
                    <span className="text-xs text-slate-400">{h.length}/30</span>
                    <button
                      onClick={() => handleCopy(h)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                <Type className="mr-1 inline h-4 w-4" /> Descricoes
              </h3>
              <div className="space-y-2">
                {data.descriptions.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <span className="flex-1 text-sm leading-relaxed text-slate-900 dark:text-zinc-100">{d}</span>
                    <button
                      onClick={() => handleCopy(d)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <GlassCard className="p-5" hover={false}>
              <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">Resumo da Campanha</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500 dark:text-zinc-400">Plataforma:</span> <span className="font-medium text-slate-900 dark:text-zinc-100">{data.platform === "google" ? "Google Ads" : "Meta Ads"}</span></div>
                <div><span className="text-slate-500 dark:text-zinc-400">Objetivo:</span> <span className="font-medium text-slate-900 dark:text-zinc-100">{OBJECTIVES.find((o) => o.id === data.objective)?.label}</span></div>
                <div><span className="text-slate-500 dark:text-zinc-400">Orcamento:</span> <span className="font-medium text-slate-900 dark:text-zinc-100">R${data.budget}/dia</span></div>
                <div><span className="text-slate-500 dark:text-zinc-400">Produto:</span> <span className="font-medium text-slate-900 dark:text-zinc-100">{data.product}</span></div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        {step < 3 && (
          <GlowButton
            variant="primary"
            size="md"
            onClick={() => canNext() && setStep(step + 1)}
            disabled={!canNext()}
            className="disabled:opacity-50"
          >
            Proximo <ArrowRight className="h-4 w-4" />
          </GlowButton>
        )}

        {step === 3 && (
          <GlowButton
            variant="primary"
            size="md"
            onClick={handleGenerate}
            disabled={!canNext() || generating}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Gerando com IA...</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Gerar Anuncios com IA</>
            )}
          </GlowButton>
        )}

        {step === 4 && (
          <GlowButton variant="primary" size="md" onClick={onClose}>
            Concluir <Check className="h-4 w-4" />
          </GlowButton>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function AnunciosPage() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [metaConnected, setMetaConnected] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <div className="mx-auto max-w-7xl py-4">
        <AdWizard onClose={() => setShowWizard(false)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
            <GradientText as="span">Central de Anuncios</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Crie e gerencie anuncios com IA para Google e Meta Ads
          </p>
        </div>
        <GlowButton variant="primary" size="md" onClick={() => setShowWizard(true)}>
          <Wand2 className="h-4 w-4" /> Criar Anuncio
        </GlowButton>
      </motion.div>

      {/* Connection Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4" />
                <path d="M2 17l10 5 10-5" stroke="#34A853" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" stroke="#FBBC05" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">Google Ads</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {googleConnected ? "Conectado" : "Nao conectado"}
              </p>
            </div>
          </div>
          <GlowButton
            size="sm"
            variant={googleConnected ? "ghost" : "primary"}
            onClick={() => setGoogleConnected(!googleConnected)}
          >
            {googleConnected ? <><Check className="h-4 w-4" /> Conectado</> : <><Plug className="h-4 w-4" /> Conectar</>}
          </GlowButton>
        </GlassCard>

        <GlassCard className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1877F2" />
                <path d="M15.5 8H14c-.83 0-1.5.67-1.5 1.5V11h3l-.5 3h-2.5v7h-3v-7H8v-3h1.5V9.5A3.5 3.5 0 0113 6h2.5v2z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">Meta Ads</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {metaConnected ? "Conectado" : "Nao conectado"}
              </p>
            </div>
          </div>
          <GlowButton
            size="sm"
            variant={metaConnected ? "ghost" : "primary"}
            onClick={() => setMetaConnected(!metaConnected)}
          >
            {metaConnected ? <><Check className="h-4 w-4" /> Conectado</> : <><Plug className="h-4 w-4" /> Conectar</>}
          </GlowButton>
        </GlassCard>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: "Gasto Total", value: 0, prefix: "R$", icon: DollarSign, color: "text-violet-500" },
          { label: "Cliques", value: 0, icon: MousePointerClick, color: "text-blue-500" },
          { label: "Conversoes", value: 0, icon: Target, color: "text-emerald-500" },
          { label: "CPA", value: 0, prefix: "R$", icon: BarChart3, color: "text-amber-500" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-slate-500 dark:text-zinc-400">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-zinc-100">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} />
            </p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Empty state / CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-8" hover={false}>
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20">
              <Wand2 className="h-10 w-10 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
                Crie seu primeiro anuncio com IA
              </h3>
              <p className="max-w-md text-sm text-slate-500 dark:text-zinc-400">
                Nosso assistente guia voce passo a passo para criar anuncios persuasivos. Escolha a plataforma, defina seu objetivo e deixe a IA gerar os textos.
              </p>
            </div>
            <GlowButton variant="primary" size="lg" onClick={() => setShowWizard(true)}>
              <Sparkles className="h-4 w-4" /> Criar Anuncio com IA <ChevronRight className="h-4 w-4" />
            </GlowButton>
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-zinc-500">
              <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> 5 passos simples</span>
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> IA gera os textos</span>
              <span className="flex items-center gap-1"><Copy className="h-3 w-3" /> Copie e cole</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
