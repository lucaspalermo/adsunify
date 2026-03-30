"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Globe, Camera, Video, ArrowRight, ArrowLeft, Loader2, Plus, Trash2, Brain, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type ChannelType = "site" | "instagram" | "tiktok"

interface Channel {
  type: ChannelType
  url: string
}

const channelOptions = [
  { type: "site" as const, label: "Tenho um Site", icon: Globe, placeholder: "meusite.com.br", color: "from-blue-500 to-cyan-500", desc: "Loja online, site institucional, blog..." },
  { type: "instagram" as const, label: "Tenho um Instagram", icon: Camera, placeholder: "@meu.perfil", color: "from-pink-500 to-purple-500", desc: "Perfil comercial ou pessoal" },
  { type: "tiktok" as const, label: "Tenho um TikTok", icon: Video, placeholder: "@meu.tiktok", color: "from-red-500 to-pink-500", desc: "Perfil com conteudo" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0) // 0 = escolher, 1 = informar URLs
  const [channels, setChannels] = useState<Channel[]>([])
  const [businessName, setBusinessName] = useState("")
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState(0)

  function toggleChannel(type: ChannelType) {
    if (channels.find(c => c.type === type)) {
      setChannels(channels.filter(c => c.type !== type))
    } else {
      setChannels([...channels, { type, url: "" }])
    }
  }

  function updateUrl(type: ChannelType, url: string) {
    setChannels(channels.map(c => c.type === type ? { ...c, url } : c))
  }

  const canNext = step === 0 ? channels.length > 0 : channels.every(c => c.url.trim().length > 0) && businessName.trim().length > 0

  async function finish() {
    setLoading(true)
    setAnalyzing(true)

    // Simular analise progressiva
    const steps = ["Conectando ao seu site...", "Analisando conteudo...", "Verificando SEO...", "Gerando diagnostico com IA...", "Pronto!"]
    for (let i = 0; i < steps.length; i++) {
      setAnalyzeStep(i)
      await new Promise(r => setTimeout(r, 1500))
    }

    try {
      const mainChannel = channels[0]
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          businessName,
          businessUrl: mainChannel.type === "site" ? mainChannel.url : undefined,
          businessNiche: mainChannel.type,
          marketingGoals: channels.map(c => c.type),
          channels: channels,
        }),
      })

      // Criar os sites no sistema
      for (const ch of channels) {
        await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: (session?.user as any)?.id || "",
            name: ch.type === "site" ? businessName : `${businessName} (${ch.type})`,
            url: ch.url,
            niche: ch.type,
          }),
        }).catch(() => {})
      }

      router.push("/painel")
    } catch {
      router.push("/painel")
    }
  }

  const analyzeSteps = ["Conectando ao seu site...", "Analisando conteudo...", "Verificando SEO...", "Gerando diagnostico com IA...", "Pronto!"]

  // Tela de analise
  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 mb-8">
            <Brain className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Analisando tudo pra voce...</h2>
        <p className="text-sm text-zinc-400 mb-8">Isso leva uns segundos. A IA esta trabalhando.</p>
        <div className="w-full max-w-sm space-y-3">
          {analyzeSteps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= analyzeStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center gap-3"
            >
              {i < analyzeStep ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs">✓</div>
              ) : i === analyzeStep ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <div className="h-6 w-6 rounded-full border border-zinc-700" />
              )}
              <span className={cn("text-sm", i <= analyzeStep ? "text-zinc-200" : "text-zinc-600")}>{s}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* Step 0: O que voce tem? */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Bem-vindo ao AdsUnify!</h2>
              <p className="text-sm text-zinc-400 mb-6">Pra comecar, me conta: o que voce tem hoje?</p>
              <p className="text-xs text-zinc-500 mb-4">Pode escolher mais de um — se voce tem site E instagram, seleciona os dois.</p>

              <div className="space-y-3">
                {channelOptions.map(opt => {
                  const selected = channels.find(c => c.type === opt.type)
                  return (
                    <motion.button
                      key={opt.type}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleChannel(opt.type)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                        selected
                          ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/20"
                          : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                      )}
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shrink-0", opt.color)}>
                        <opt.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-zinc-100">{opt.label}</span>
                        <p className="text-xs text-zinc-500">{opt.desc}</p>
                      </div>
                      {selected && (
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-xs">✓</div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={() => setStep(1)} disabled={!canNext}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                    canNext ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}>
                  Proximo <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Cole os links */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Agora cole seus links</h2>
              <p className="text-sm text-zinc-400 mb-6">A IA vai analisar tudo e te mostrar exatamente o que fazer.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nome do seu negocio *</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} autoFocus
                    placeholder="Ex: Loja da Maria, Studio Fitness"
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                </div>

                {channels.map(ch => {
                  const opt = channelOptions.find(o => o.type === ch.type)!
                  return (
                    <div key={ch.type}>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-1.5">
                        <opt.icon className="h-4 w-4" />
                        {ch.type === "site" ? "Endereco do site" : ch.type === "instagram" ? "Seu @ do Instagram" : "Seu @ do TikTok"}
                      </label>
                      <input type="text" value={ch.url} onChange={e => updateUrl(ch.type, e.target.value)}
                        placeholder={opt.placeholder}
                        className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
                <button onClick={finish} disabled={!canNext || loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analisar e Comecar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
