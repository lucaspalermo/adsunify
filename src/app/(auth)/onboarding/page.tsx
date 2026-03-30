"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowLeft, ArrowRight, Loader2, Sparkles, Rocket, Target, Brain, Globe } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GlowButton } from "@/components/shared/glow-button"
import { GradientText } from "@/components/shared/gradient-text"
import { cn } from "@/lib/utils"

const niches = [
  { label: "E-commerce", emoji: "🛒" },
  { label: "Saude e Bem-estar", emoji: "💚" },
  { label: "Educacao", emoji: "📚" },
  { label: "Alimentacao", emoji: "🍽️" },
  { label: "Servicos Profissionais", emoji: "💼" },
  { label: "Imobiliario", emoji: "🏠" },
  { label: "Beleza e Estetica", emoji: "💄" },
  { label: "Tecnologia", emoji: "💻" },
  { label: "Moda", emoji: "👗" },
  { label: "Fitness", emoji: "🏋️" },
  { label: "Marketing", emoji: "📈" },
  { label: "Outro", emoji: "🔮" },
]

const objectives = [
  { label: "Aumentar trafego", emoji: "🚀", icon: Rocket },
  { label: "Gerar mais vendas", emoji: "💰", icon: Target },
  { label: "Conseguir mais leads", emoji: "🎯", icon: Target },
  { label: "Melhorar SEO", emoji: "🔍", icon: Globe },
  { label: "Crescer nas redes sociais", emoji: "📱", icon: Sparkles },
  { label: "Fortalecer marca", emoji: "⭐", icon: Sparkles },
  { label: "Aprender trafego pago", emoji: "📊", icon: Brain },
  { label: "Usar IA no marketing", emoji: "🤖", icon: Brain },
]

const budgetRanges = [
  { label: "Ainda nao invisto", value: 0, desc: "Vou comecar agora" },
  { label: "Ate R$500/mes", value: 500, desc: "Iniciante" },
  { label: "R$500 a R$2.000/mes", value: 1250, desc: "Intermediario" },
  { label: "R$2.000 a R$5.000/mes", value: 3500, desc: "Avancado" },
  { label: "Mais de R$5.000/mes", value: 7500, desc: "Profissional" },
]

const stepLabels = ["Negocio", "Nicho", "Objetivos", "Orcamento"]
const stepIcons = [Globe, Target, Rocket, Brain]

/* ── Animated mascot SVG ── */
function AIMascot({ step }: { step: number }) {
  const messages = [
    "Ola! Vou conhecer seu negocio para criar a melhor estrategia.",
    "Otimo! Saber seu nicho me ajuda a personalizar tudo.",
    "Perfeito! Com seus objetivos, vou tracar o caminho ideal.",
    "Quase la! Seu orcamento define as melhores taticas.",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex items-start gap-3"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-500/20"
      >
        <Brain className="h-5 w-5 text-white" />
      </motion.div>
      <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {messages[step - 1]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── Step Indicator (improved) ── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-1">
      {stepLabels.map((label, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep
        const Icon = stepIcons[i]

        return (
          <div key={step} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                  isCompleted && "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
                  isCurrent && "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-violet-500/30",
                  !isCompleted && !isCurrent && "border border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                )}
              >
                {isCompleted ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </motion.div>
              <span className={cn(
                "mt-1.5 text-[10px] font-medium whitespace-nowrap",
                isCurrent ? "text-slate-900 dark:text-zinc-100" : "text-slate-400 dark:text-zinc-500"
              )}>
                {label}
              </span>
            </div>
            {step < 4 && (
              <div className={cn(
                "mx-1 mb-5 h-0.5 w-8 rounded-full transition-colors duration-500",
                step < currentStep ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-700"
              )}>
                {step < currentStep && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Animated Loading Screen ── */
function LoadingScreen() {
  const steps = [
    { label: "Analisando seu nicho...", delay: 0 },
    { label: "Criando estrategia personalizada...", delay: 0.8 },
    { label: "Configurando seu Co-Piloto IA...", delay: 1.6 },
    { label: "Preparando dashboard...", delay: 2.4 },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Animated logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-violet-500/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl"
          />
        </motion.div>

        {/* Progress steps */}
        <div className="flex flex-col items-center gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay, duration: 0.5 }}
              className="flex items-center gap-2 text-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: step.delay + 0.3, type: "spring" }}
              >
                <Check className="h-4 w-4 text-emerald-500" />
              </motion.div>
              <span className="text-slate-600 dark:text-zinc-300">{step.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="text-lg font-semibold text-slate-900 dark:text-zinc-100"
        >
          Tudo pronto! Redirecionando...
        </motion.p>
      </motion.div>
    </div>
  )
}

/* ── Main Page ── */
export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [businessName, setBusinessName] = useState("")
  const [businessUrl, setBusinessUrl] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [businessNiche, setBusinessNiche] = useState("")
  const [marketingGoals, setMarketingGoals] = useState<string[]>([])
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null)

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return businessName.trim().length > 0
      case 2: return businessNiche.length > 0
      case 3: return marketingGoals.length > 0
      case 4: return monthlyBudget !== null
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessUrl, businessDescription, businessNiche, marketingGoals, monthlyBudget }),
      })
      setTimeout(() => router.push("/painel"), 3500)
    } catch {
      setIsSubmitting(false)
    }
  }

  const toggleGoal = (goal: string) => {
    setMarketingGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, filter: "blur(4px)" }),
  }

  if (isSubmitting) return <LoadingScreen />

  const inputClass = cn(
    "w-full rounded-xl border px-4 py-3 text-sm transition-all",
    "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
    "focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30",
    "dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500/50"
  )

  const cardClass = (isSelected: boolean) => cn(
    "relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer",
    isSelected
      ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10"
      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fc] px-4 py-12 dark:bg-[#09090B]">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100" style={{ fontFamily: "var(--font-heading)" }}>
            Configurar{" "}
            <GradientText as="span" from="from-indigo-500" via="via-violet-500" to="to-purple-500">
              AdsUnify
            </GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Passo {currentStep} de 4
          </p>
        </motion.div>

        <StepIndicator currentStep={currentStep} />
        <AIMascot step={currentStep} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          >
            {currentStep === 1 && (
              <GlassCard className="p-8">
                <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-zinc-100">Conte-nos sobre seu negocio</h2>
                <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">
                  Essas informacoes ajudam nosso Co-Piloto IA a entender seu mercado
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-zinc-300">
                      Nome do negocio <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Minha Loja Online" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-zinc-300">
                      URL do site <span className="text-slate-400 dark:text-zinc-500">(opcional)</span>
                    </label>
                    <input type="url" value={businessUrl} onChange={(e) => setBusinessUrl(e.target.value)} placeholder="https://www.seusite.com.br" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-zinc-300">Descricao breve</label>
                    <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="Descreva brevemente o que seu negocio faz..." rows={3} className={cn(inputClass, "resize-none")} />
                  </div>
                </div>
              </GlassCard>
            )}

            {currentStep === 2 && (
              <GlassCard className="p-8">
                <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-zinc-100">Qual eh o seu nicho?</h2>
                <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">Selecione o nicho que melhor representa seu negocio</p>
                <div className="grid grid-cols-3 gap-3">
                  {niches.map((niche) => {
                    const isSelected = businessNiche === niche.label
                    return (
                      <motion.button
                        key={niche.label}
                        onClick={() => setBusinessNiche(niche.label)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(cardClass(isSelected), "flex-col items-center text-center")}
                      >
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-1.5 top-1.5">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </motion.div>
                        )}
                        <span className="mb-1 block text-2xl">{niche.emoji}</span>
                        <span className={cn("text-xs", isSelected ? "font-semibold text-slate-900 dark:text-zinc-100" : "text-slate-500 dark:text-zinc-400")}>
                          {niche.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            )}

            {currentStep === 3 && (
              <GlassCard className="p-8">
                <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-zinc-100">O que voce quer alcancar?</h2>
                <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">Selecione todos que se aplicam</p>
                <div className="grid grid-cols-2 gap-3">
                  {objectives.map((obj) => {
                    const isSelected = marketingGoals.includes(obj.label)
                    return (
                      <motion.button
                        key={obj.label}
                        onClick={() => toggleGoal(obj.label)}
                        whileTap={{ scale: 0.95 }}
                        className={cardClass(isSelected)}
                      >
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-1.5 top-1.5">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </motion.div>
                        )}
                        <span className="mb-1 block text-xl">{obj.emoji}</span>
                        <span className={cn("text-sm", isSelected ? "font-semibold text-slate-900 dark:text-zinc-100" : "text-slate-500 dark:text-zinc-400")}>
                          {obj.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            )}

            {currentStep === 4 && (
              <GlassCard className="p-8">
                <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-zinc-100">Seu orcamento mensal</h2>
                <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">Isso ajuda a recomendar as melhores estrategias</p>
                <div className="flex flex-col gap-3">
                  {budgetRanges.map((budget) => {
                    const isSelected = monthlyBudget === budget.value
                    return (
                      <motion.button
                        key={budget.value}
                        onClick={() => setMonthlyBudget(budget.value)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(cardClass(isSelected), "flex items-center justify-between")}
                      >
                        <div>
                          <span className={cn("block text-sm", isSelected ? "font-semibold text-slate-900 dark:text-zinc-100" : "text-slate-600 dark:text-zinc-300")}>
                            {budget.label}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500">{budget.desc}</span>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check className="h-5 w-5 text-emerald-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {currentStep > 1 ? (
            <GlowButton variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </GlowButton>
          ) : <div />}

          {currentStep < 4 ? (
            <GlowButton onClick={handleNext} disabled={!canGoNext()}>
              Proximo <ArrowRight className="ml-1 h-4 w-4" />
            </GlowButton>
          ) : (
            <GlowButton onClick={handleSubmit} disabled={!canGoNext()}>
              <Sparkles className="mr-1 h-4 w-4" /> Comecar!
            </GlowButton>
          )}
        </div>
      </div>
    </div>
  )
}
