"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Camera, MapPin, ShoppingBag, DollarSign, Users, Phone, ArrowRight, Loader2, CheckCircle2, Circle } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

/* ── types ───────────────────────────────────────── */

type Platform = "site" | "instagram" | "local" | "marketplace" | null
type Objective = "vendas" | "seguidores" | "contatos" | null

const platforms = [
  {
    id: "site" as const,
    emoji: "\ud83c\udf10",
    title: "Meu Site",
    desc: "Tenho um site ou loja online",
    placeholder: "www.seusite.com.br",
    inputLabel: "URL do seu site",
    prefix: "",
  },
  {
    id: "instagram" as const,
    emoji: "\ud83d\udcf8",
    title: "Meu Instagram",
    desc: "Quero crescer meu perfil no Instagram",
    placeholder: "@seuperfil",
    inputLabel: "Seu perfil do Instagram",
    prefix: "",
  },
  {
    id: "local" as const,
    emoji: "\ud83d\udcf1",
    title: "Meu Negocio Local",
    desc: "Tenho uma loja fisica ou servico local",
    placeholder: "Nome do negocio + cidade",
    inputLabel: "Nome do negocio e cidade",
    prefix: "",
  },
  {
    id: "marketplace" as const,
    emoji: "\ud83d\udecd\ufe0f",
    title: "Minha Loja Online",
    desc: "Vendo em Mercado Livre, Shopee, etc",
    placeholder: "Link da sua loja",
    inputLabel: "Link da sua loja",
    prefix: "",
  },
]

const objectives = [
  {
    id: "vendas" as const,
    emoji: "\ud83d\udcb0",
    title: "Quero mais VENDAS",
    desc: "Atrair clientes que comprem meu produto/servico",
  },
  {
    id: "seguidores" as const,
    emoji: "\ud83d\udc65",
    title: "Quero mais SEGUIDORES",
    desc: "Crescer minha audiencia nas redes sociais",
  },
  {
    id: "contatos" as const,
    emoji: "\ud83d\udcde",
    title: "Quero mais CONTATOS",
    desc: "Receber mais mensagens, ligacoes e orcamentos",
  },
]

/* ── animation variants ──────────────────────────── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
}

const slideIn = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  show: { opacity: 1, height: "auto", marginTop: 16, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.25 } },
}

/* ── page ────────────────────────────────────────── */

export default function SetupPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [platform, setPlatform] = useState<Platform>(null)
  const [platformUrl, setPlatformUrl] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [objective, setObjective] = useState<Objective>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState("")

  const canSubmit = platform && objective

  async function handleSubmit() {
    if (!canSubmit) return
    setError("")
    setLoading(true)
    setLoadingStep(1)

    const userId = session?.user?.id || "demo"

    // Animate loading steps
    setTimeout(() => setLoadingStep(2), 1500)
    setTimeout(() => setLoadingStep(3), 5000)

    try {
      // Use the AI-powered analysis API for websites
      const apiUrl = platform === "site" && platformUrl.includes(".")
        ? "/api/analyze-site"
        : "/api/setup"

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          platform,
          url: platformUrl.trim() || platform,
          platformUrl: platformUrl.trim() || platform,
          businessDescription: businessDescription.trim() || "Nao informado",
          objective,
        }),
      })

      if (res.ok) {
        setLoadingStep(4)
        setTimeout(() => router.push("/painel"), 1500)
      } else {
        const data = await res.json().catch(() => ({ error: "Erro desconhecido" }))
        setError(data.error || "Erro ao salvar. Tente novamente.")
        setLoading(false)
      }
    } catch {
      setError("Erro de conexao. Tente novamente.")
      setLoading(false)
    }
  }

  /* ── loading overlay with step progress ─────── */
  if (loading) {
    const loadingSteps = [
      { label: "Acessando e analisando seu site...", done: loadingStep >= 2 },
      { label: "Descobrindo palavras-chave do seu nicho com IA...", done: loadingStep >= 3 },
      { label: "Criando plano de marketing personalizado com IA...", done: loadingStep >= 4 },
      { label: "Pronto! Abrindo seu painel...", done: loadingStep >= 4 },
    ]

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-violet-600" />
        </motion.div>
        <div className="w-full max-w-md space-y-3">
          {loadingSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: loadingStep >= i + 1 ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.3, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : loadingStep >= i + 1 ? (
                <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                step.done ? "text-green-600 font-medium" : loadingStep >= i + 1 ? "text-slate-700" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      {/* ── Header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3 text-center"
      >
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          <GradientText>Vamos comecar!</GradientText>
        </h1>
        <p className="text-base text-slate-500 sm:text-lg">
          Me diz o que voce quer divulgar e eu vou criar um plano completo para voce crescer.
        </p>
      </motion.div>

      {/* ── Platform Selection ──────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="show">
        <motion.h2 variants={fadeUp} className="mb-5 text-lg font-semibold text-slate-900">
          O que voce quer divulgar?
        </motion.h2>

        <GlassCard hover={false} className="p-6 sm:p-8">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {platforms.map((p) => (
              <motion.div key={p.id} variants={fadeUp}>
                <button
                  onClick={() => {
                    setPlatform(p.id)
                    setPlatformUrl("")
                  }}
                  className={cn(
                    "w-full rounded-xl border-2 p-5 text-left transition-all",
                    platform === p.id
                      ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Platform URL input ──────────────── */}
          <AnimatePresence mode="wait">
            {platform && (
              <motion.div
                key={platform}
                variants={slideIn}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {platforms.find((p) => p.id === platform)?.inputLabel}
                </label>
                <input
                  type="text"
                  value={platformUrl}
                  onChange={(e) => setPlatformUrl(e.target.value)}
                  placeholder={platforms.find((p) => p.id === platform)?.placeholder}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.section>

      {/* ── Business Description ────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Sobre seu negocio</h2>

        <GlassCard hover={false} className="space-y-6 p-6 sm:p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              O que voce vende ou oferece?
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Ex: Sou dentista e atendo em SP, Vendo roupas femininas online, Sou personal trainer..."
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Qual seu objetivo principal?
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {objectives.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-center transition-all",
                    objective === obj.id
                      ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <span className="mb-2 block text-2xl">{obj.emoji}</span>
                  <p className="text-sm font-semibold text-slate-900">{obj.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{obj.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* ── Submit ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col items-center gap-3"
      >
        <GlowButton
          size="lg"
          className="gap-2 px-10 text-base"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Criar Meu Plano de Marketing
          <ArrowRight className="h-5 w-5" />
        </GlowButton>
        <p className="text-xs text-slate-400">Isso leva menos de 1 minuto</p>
      </motion.div>
    </div>
  )
}
