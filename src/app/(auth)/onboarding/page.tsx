"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Globe, Target, Rocket, ArrowRight, ArrowLeft, Loader2, Check, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const niches = [
  { id: "ecommerce", label: "Loja Online", emoji: "🛍️" },
  { id: "servicos", label: "Servicos", emoji: "🔧" },
  { id: "saude", label: "Saude / Bem-estar", emoji: "💚" },
  { id: "educacao", label: "Educacao", emoji: "📚" },
  { id: "alimentacao", label: "Alimentacao", emoji: "🍕" },
  { id: "beleza", label: "Beleza / Estetica", emoji: "💅" },
  { id: "tech", label: "Tecnologia / SaaS", emoji: "💻" },
  { id: "imobiliario", label: "Imobiliario", emoji: "🏠" },
  { id: "fitness", label: "Fitness / Academia", emoji: "💪" },
  { id: "moda", label: "Moda / Vestuario", emoji: "👗" },
  { id: "pet", label: "Pet Shop", emoji: "🐾" },
  { id: "outro", label: "Outro", emoji: "✨" },
]

const goals = [
  { id: "trafego", label: "Mais visitantes no meu site", emoji: "👀" },
  { id: "vendas", label: "Vender mais online", emoji: "💰" },
  { id: "leads", label: "Captar contatos de clientes", emoji: "📋" },
  { id: "marca", label: "Fortalecer minha marca", emoji: "⭐" },
  { id: "seo", label: "Aparecer no Google", emoji: "🔍" },
  { id: "social", label: "Crescer nas redes sociais", emoji: "📱" },
  { id: "anuncios", label: "Criar anuncios que funcionam", emoji: "📢" },
  { id: "conteudo", label: "Criar conteudo com IA", emoji: "✍️" },
]

const steps = [
  { title: "Seu Negocio", desc: "Qual o nome e site do seu negocio?", icon: Globe },
  { title: "Seu Nicho", desc: "Em que area voce atua?", icon: Target },
  { title: "Seus Objetivos", desc: "O que voce quer alcançar?", icon: Rocket },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Form data
  const [businessName, setBusinessName] = useState("")
  const [businessUrl, setBusinessUrl] = useState("")
  const [selectedNiche, setSelectedNiche] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const canNext = step === 0 ? businessName.trim().length > 0 :
                  step === 1 ? selectedNiche.length > 0 :
                  selectedGoals.length > 0

  function toggleGoal(id: string) {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  async function finish() {
    setLoading(true)
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          businessName,
          businessUrl: businessUrl || undefined,
          businessNiche: selectedNiche,
          marketingGoals: selectedGoals,
        }),
      })
      router.push("/painel")
    } catch {
      router.push("/painel")
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      {/* AI Mascot */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
          <Brain className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
              i < step ? "bg-green-500 text-white" :
              i === step ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20" :
              "bg-zinc-800 text-zinc-500"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-8 rounded-full transition-colors", i < step ? "bg-green-500" : "bg-zinc-800")} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6"
          >
            <h2 className="text-xl font-bold text-zinc-100 mb-1">{steps[step].title}</h2>
            <p className="text-sm text-zinc-400 mb-6">{steps[step].desc}</p>

            {/* Step 0: Business Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nome do seu negocio *</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} autoFocus
                    placeholder="Ex: Loja da Maria, Studio Fitness, etc"
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Site (se tiver)</label>
                  <input type="text" value={businessUrl} onChange={e => setBusinessUrl(e.target.value)}
                    placeholder="Ex: meusite.com.br"
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                  <p className="text-[11px] text-zinc-500 mt-1">Se voce tem um site, vamos analisa-lo automaticamente</p>
                </div>
              </div>
            )}

            {/* Step 1: Niche */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-2">
                {niches.map(n => (
                  <button key={n.id} onClick={() => setSelectedNiche(n.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all",
                      selectedNiche === n.id
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                        : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                    )}>
                    <span className="text-xl">{n.emoji}</span>
                    <span className="text-[11px] font-medium text-zinc-300">{n.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {goals.map(g => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
                      selectedGoals.includes(g.id)
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                        : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                    )}>
                    <span className="text-lg">{g.emoji}</span>
                    <span className="text-xs font-medium text-zinc-300">{g.label}</span>
                  </button>
                ))}
                <p className="col-span-2 text-[11px] text-zinc-500 text-center mt-1">Escolha quantos quiser</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              ) : <div />}

              {step < 2 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canNext}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                    canNext
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}>
                  Proximo <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={finish} disabled={!canNext || loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  {loading ? "Preparando..." : "Comecar!"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
