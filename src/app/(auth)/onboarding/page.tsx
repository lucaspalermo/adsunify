"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GlowButton } from "@/components/shared/glow-button"
import { GradientText } from "@/components/shared/gradient-text"
import { StepIndicator } from "@/components/onboarding/step-indicator"

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
  { label: "Aumentar trafego", emoji: "🚀" },
  { label: "Gerar mais vendas", emoji: "💰" },
  { label: "Conseguir mais leads", emoji: "🎯" },
  { label: "Melhorar SEO", emoji: "🔍" },
  { label: "Crescer nas redes sociais", emoji: "📱" },
  { label: "Fortalecer marca", emoji: "⭐" },
  { label: "Aprender trafego pago", emoji: "📊" },
  { label: "Usar IA no marketing", emoji: "🤖" },
]

const budgetRanges = [
  { label: "Ainda nao invisto", value: 0 },
  { label: "Ate R$500/mes", value: 500 },
  { label: "R$500 a R$2.000/mes", value: 1250 },
  { label: "R$2.000 a R$5.000/mes", value: 3500 },
  { label: "Mais de R$5.000/mes", value: 7500 },
]

const stepLabels = ["Sobre seu Negocio", "Seu Nicho", "Seus Objetivos", "Seu Orcamento"]

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
      case 1:
        return businessName.trim().length > 0
      case 2:
        return businessNiche.length > 0
      case 3:
        return marketingGoals.length > 0
      case 4:
        return monthlyBudget !== null
      default:
        return false
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
        body: JSON.stringify({
          businessName,
          businessUrl,
          businessDescription,
          businessNiche,
          marketingGoals,
          monthlyBudget,
        }),
      })
      setTimeout(() => {
        router.push("/painel")
      }, 2000)
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
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-slate-900 text-lg font-medium">
            Preparando seu painel personalizado...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={4}
          labels={stepLabels}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStep === 1 && (
              <GlassCard className="p-8">
                <GradientText className="text-2xl font-bold mb-2">
                  Conte-nos sobre seu negocio
                </GradientText>
                <p className="text-slate-500 mb-6">
                  Essas informacoes ajudam nosso Co-Piloto IA a entender seu mercado
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Nome do negocio <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Minha Loja Online"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      URL do site <span className="text-slate-400">(opcional)</span>
                    </label>
                    <input
                      type="url"
                      value={businessUrl}
                      onChange={(e) => setBusinessUrl(e.target.value)}
                      placeholder="https://www.seusite.com.br"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Descricao breve
                    </label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Descreva brevemente o que seu negocio faz..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </GlassCard>
            )}

            {currentStep === 2 && (
              <GlassCard className="p-8">
                <GradientText className="text-2xl font-bold mb-2">
                  Qual eh o seu nicho?
                </GradientText>
                <p className="text-slate-500 mb-6">
                  Selecione o nicho que melhor representa seu negocio
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {niches.map((niche) => {
                    const isSelected = businessNiche === niche.label
                    return (
                      <motion.button
                        key={niche.label}
                        onClick={() => setBusinessNiche(niche.label)}
                        whileTap={{ scale: 0.95 }}
                        animate={{ scale: isSelected ? 1.05 : 1 }}
                        className={`relative p-4 rounded-xl text-center transition-all ${
                          isSelected
                            ? "bg-slate-100 border-2 border-transparent"
                            : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderImage: "linear-gradient(to right, #7c3aed, #2563eb) 1",
                              }
                            : undefined
                        }
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                        <span className="text-2xl block mb-1">{niche.emoji}</span>
                        <span className={`text-sm ${isSelected ? "text-slate-900 font-medium" : "text-slate-500"}`}>
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
                <GradientText className="text-2xl font-bold mb-2">
                  O que voce quer alcancar?
                </GradientText>
                <p className="text-slate-500 mb-6">
                  Selecione todos que se aplicam
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {objectives.map((obj) => {
                    const isSelected = marketingGoals.includes(obj.label)
                    return (
                      <motion.button
                        key={obj.label}
                        onClick={() => toggleGoal(obj.label)}
                        whileTap={{ scale: 0.95 }}
                        animate={{ scale: isSelected ? 1.05 : 1 }}
                        className={`relative p-4 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-slate-100 border-2 border-transparent"
                            : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderImage: "linear-gradient(to right, #7c3aed, #2563eb) 1",
                              }
                            : undefined
                        }
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                        <span className="text-xl block mb-1">{obj.emoji}</span>
                        <span className={`text-sm ${isSelected ? "text-slate-900 font-medium" : "text-slate-500"}`}>
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
                <GradientText className="text-2xl font-bold mb-2">
                  Qual seu orcamento mensal para marketing?
                </GradientText>
                <p className="text-slate-500 mb-6">
                  Isso nos ajuda a recomendar as melhores estrategias
                </p>

                <div className="flex flex-col gap-3">
                  {budgetRanges.map((budget) => {
                    const isSelected = monthlyBudget === budget.value
                    return (
                      <motion.button
                        key={budget.value}
                        onClick={() => setMonthlyBudget(budget.value)}
                        whileTap={{ scale: 0.98 }}
                        animate={{ scale: isSelected ? 1.02 : 1 }}
                        className={`relative p-4 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-slate-100 border-2 border-transparent"
                            : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderImage: "linear-gradient(to right, #7c3aed, #2563eb) 1",
                              }
                            : undefined
                        }
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                        <span className={`text-base ${isSelected ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                          {budget.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          {currentStep > 1 ? (
            <GlowButton variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </GlowButton>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <GlowButton onClick={handleNext} disabled={!canGoNext()}>
              Proximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlowButton>
          ) : (
            <GlowButton onClick={handleSubmit} disabled={!canGoNext()}>
              Comecar!
              <ArrowRight className="w-4 h-4 ml-2" />
            </GlowButton>
          )}
        </div>
      </div>
    </div>
  )
}
