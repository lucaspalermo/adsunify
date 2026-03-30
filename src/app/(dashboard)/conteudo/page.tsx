"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Image,
  Megaphone,
  Mail,
  MoreHorizontal,
  Clock,
  Eye,
  Pencil,
  Sparkles,
  X,
  Copy,
  Save,
  RefreshCw,
  Loader2,
  Check,
  ChevronDown,
  Info,
  Lightbulb,
  Zap,
  ArrowRight,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"
import Link from "next/link"

/* ───────────────────── constants ───────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

type ContentType = "ARTICLE" | "SOCIAL_POST" | "AD_COPY" | "EMAIL"

interface ActionCard {
  title: string
  description: string
  benefit: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  glow: string
  type: ContentType
}

const actionCards: ActionCard[] = [
  {
    title: "Artigo para Blog",
    description: "Artigo completo otimizado para SEO",
    benefit: "Atrai visitantes do Google para seu site (SEO)",
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-500/10",
    glow: "rgba(139, 92, 246, 0.15)",
    type: "ARTICLE",
  },
  {
    title: "Post para Instagram",
    description: "Carrosseis e legendas que engajam",
    benefit: "Legendas prontas que geram engajamento",
    icon: Image,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    glow: "rgba(236, 72, 153, 0.15)",
    type: "SOCIAL_POST",
  },
  {
    title: "Texto de Anuncio",
    description: "Copies para Google e Meta Ads",
    benefit: "Textos persuasivos para Google e Facebook Ads",
    icon: Megaphone,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    glow: "rgba(245, 158, 11, 0.15)",
    type: "AD_COPY",
  },
  {
    title: "Email Marketing",
    description: "Sequencias que convertem",
    benefit: "Emails que fazem seus clientes voltarem",
    icon: Mail,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    glow: "rgba(6, 182, 212, 0.15)",
    type: "EMAIL",
  },
]

const toneOptions = [
  { value: "professional", label: "Profissional", description: "Para passar credibilidade" },
  { value: "casual", label: "Casual", description: "Como uma conversa entre amigos" },
  { value: "engaging", label: "Engajador", description: "Para prender a atencao nas redes sociais" },
  { value: "persuasive", label: "Persuasivo", description: "Para convencer e vender" },
  { value: "educational", label: "Educativo", description: "Para ensinar e informar" },
]

const suggestedTopics = [
  "10 dicas para iniciantes em...",
  "Como escolher o melhor...",
  "Guia completo de...",
  "5 erros que todo mundo comete em...",
  "Por que voce deveria investir em...",
  "O passo a passo para...",
  "Tudo o que voce precisa saber sobre...",
  "Como economizar dinheiro com...",
]

type ContentStatus = "Publicado" | "Rascunho" | "Revisao"

interface ContentItem {
  title: string
  type: string
  status: ContentStatus
  date: string
}

const contents: ContentItem[] = []

const statusStyles: Record<ContentStatus, string> = {
  Publicado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Rascunho: "bg-gray-500/20 text-slate-500 border-gray-500/30",
  Revisao: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const typeStyles: Record<string, string> = {
  Artigo: "bg-violet-500/20 text-violet-600 border-violet-500/30",
  Instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Anuncio: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Email: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
}

const usedContent = 0
const totalContent = 10

/* ───────────────────── component ───────────────────── */

function ConteudoPageInner() {
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get("tipo") as ContentType | null
  const userId = useUserId()

  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // modal / generation state
  const [selectedCard, setSelectedCard] = useState<ActionCard | null>(null)
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [tone, setTone] = useState(toneOptions[0].value)
  const [toneOpen, setToneOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isDone, setIsDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const showEmptyState = contents.length === 0

  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* ── helpers ── */

  const resetForm = useCallback(() => {
    setTopic("")
    setKeywords("")
    setTone(toneOptions[0].value)
    setGeneratedContent("")
    setIsDone(false)
    setCopied(false)
    setShowSuggestions(false)
  }, [])

  // Auto-open modal based on query param
  useEffect(() => {
    if (tipoParam) {
      const matchedCard = actionCards.find((c) => c.type === tipoParam)
      if (matchedCard) {
        resetForm()
        setSelectedCard(matchedCard)
      }
    }
  }, [tipoParam, resetForm])

  const closeModal = useCallback(() => {
    abortRef.current?.abort()
    setSelectedCard(null)
    setIsGenerating(false)
    resetForm()
  }, [resetForm])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement("textarea")
      ta.value = generatedContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [generatedContent])

  /* ── streaming generation ── */

  const handleGenerate = useCallback(async () => {
    if (!selectedCard || !topic.trim()) return

    setIsGenerating(true)
    setGeneratedContent("")
    setIsDone(false)
    setCopied(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedCard.type,
          topic: topic.trim(),
          keywords: keywords.trim(),
          tone,
          userId: userId || "demo",
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        // keep last potentially incomplete line in buffer
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed === "data: [DONE]") {
            setIsDone(true)
            setIsGenerating(false)
            return
          }
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              if (data.text) {
                setGeneratedContent((prev) => prev + data.text)
              }
            } catch {
              // skip malformed JSON chunks
            }
          }
        }
      }

      // stream ended without [DONE]
      setIsDone(true)
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setGeneratedContent(
          (prev) => prev + "\n\n[Erro ao gerar conteudo. Tente novamente.]"
        )
      }
    } finally {
      setIsGenerating(false)
      setIsDone(true)
    }
  }, [selectedCard, topic, keywords, tone])

  const handleRegenerate = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const selectedToneOption =
    toneOptions.find((t) => t.value === tone)
  const selectedToneLabel = selectedToneOption?.label ?? tone

  const remaining = totalContent - usedContent
  const usagePercent = Math.round((usedContent / totalContent) * 100)

  /* ───────────────────── render ───────────────────── */

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText>Fabrica de Conteudo</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Crie conteudos otimizados com inteligencia artificial
        </p>
      </motion.div>

      {/* Beginner-friendly explanation banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <GlassCard className="p-5" hover={false} glow glowColor="rgba(139, 92, 246, 0.08)">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Info className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Como funciona?
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                A Fabrica de Conteudo usa{" "}
                <span className="text-violet-600 font-medium">Inteligencia Artificial</span>{" "}
                para criar textos profissionais para voce em segundos.
                Escolha o tipo de conteudo, diga sobre o que quer escrever, e nossa IA faz o resto!
                Nao precisa ser escritor — a IA cuida de tudo.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actionCards.map((card, i) => (
          <motion.div
            key={card.title}
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => {
              resetForm()
              setSelectedCard(card)
            }}
          >
            <GlassCard
              className="p-5 cursor-pointer group"
              glow={hoveredCard === i}
              glowColor={card.glow}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl mb-3 transition-transform duration-200 group-hover:scale-110",
                  card.bg
                )}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                {card.benefit}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ────────── Generation Modal ────────── */}
      <AnimatePresence>
        {selectedCard && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl"
                initial={{ scale: 0.92, y: 32, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, y: 32, opacity: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* modal header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        selectedCard.bg
                      )}
                    >
                      <selectedCard.icon
                        className={cn("h-4 w-4", selectedCard.color)}
                      />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        {selectedCard.title}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {selectedCard.benefit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* modal body */}
                <div className="space-y-5 px-6 py-5">
                  {/* topic */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Sobre o que voce quer escrever?{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ex: '10 dicas para...' ou 'Como escolher...' — escreva o tema do seu conteudo"
                      disabled={isGenerating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-violet-500/50 focus:bg-slate-100 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      disabled={isGenerating}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-300 transition-colors disabled:opacity-50"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Nao sei o que escrever — me de ideias!
                    </button>

                    {/* Topic suggestions */}
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                            <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider font-medium">
                              Clique em uma ideia para usar
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {suggestedTopics.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => {
                                    setTopic(suggestion)
                                    setShowSuggestions(false)
                                  }}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* keywords */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Palavras-chave{" "}
                      <span className="text-slate-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="ex: marketing digital, SEO, trafego"
                      disabled={isGenerating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-violet-500/50 focus:bg-slate-100 disabled:opacity-50"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Palavras que a IA vai incluir no texto para ajudar no SEO
                    </p>
                  </div>

                  {/* tone dropdown */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Tom de voz
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setToneOpen(!toneOpen)}
                        disabled={isGenerating}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:bg-slate-100 focus:border-violet-500/50 disabled:opacity-50"
                      >
                        <div className="text-left">
                          <span>{selectedToneLabel}</span>
                          {selectedToneOption && (
                            <span className="ml-2 text-xs text-slate-400">
                              — {selectedToneOption.description}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-slate-500 transition-transform shrink-0",
                            toneOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {toneOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                          >
                            {toneOptions.map((opt) => (
                              <li key={opt.value}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTone(opt.value)
                                    setToneOpen(false)
                                  }}
                                  className={cn(
                                    "w-full px-4 py-2.5 text-left transition-colors hover:bg-slate-50",
                                    tone === opt.value
                                      ? "bg-violet-500/10"
                                      : ""
                                  )}
                                >
                                  <span className={cn(
                                    "text-sm font-medium",
                                    tone === opt.value ? "text-violet-600" : "text-slate-600"
                                  )}>
                                    {opt.label}
                                  </span>
                                  <span className="ml-2 text-xs text-slate-400">
                                    — {opt.description}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* generate button */}
                  {!isDone && !isGenerating && (
                    <GlowButton
                      className="w-full"
                      disabled={!topic.trim()}
                      onClick={handleGenerate}
                    >
                      <Sparkles className="h-4 w-4" />
                      Gerar Conteudo com IA
                    </GlowButton>
                  )}

                  {/* streaming output area */}
                  {(isGenerating || generatedContent) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {/* status indicator */}
                      {isGenerating && (
                        <motion.div
                          className="flex items-center gap-2 text-xs text-violet-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {generatedContent
                            ? "A IA esta escrevendo seu conteudo..."
                            : "Aguardando resposta da IA..."}
                        </motion.div>
                      )}

                      {isDone && (
                        <motion.div
                          className="flex items-center gap-2 text-xs text-emerald-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Pronto! Seu conteudo foi gerado com sucesso
                        </motion.div>
                      )}

                      {/* text area */}
                      <textarea
                        ref={textareaRef}
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        readOnly={isGenerating}
                        rows={12}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-colors focus:border-violet-500/50 focus:bg-slate-50 resize-y font-mono"
                        placeholder="O conteudo aparecera aqui..."
                      />

                      {/* action buttons after generation */}
                      {isDone && (
                        <motion.div
                          className="flex flex-wrap items-center gap-2"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <GlowButton size="sm" onClick={handleCopy}>
                            {copied ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            {copied ? "Copiado!" : "Copiar"}
                          </GlowButton>

                          <GlowButton
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              // placeholder for save
                              alert(
                                "Funcionalidade de salvar sera conectada em breve."
                              )
                            }}
                          >
                            <Save className="h-3.5 w-3.5" />
                            Salvar
                          </GlowButton>

                          <GlowButton
                            size="sm"
                            variant="ghost"
                            onClick={handleRegenerate}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Gerar novamente
                          </GlowButton>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content List */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={4}
      >
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Seus Conteudos
            </h2>
          </div>

          <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
            <p className="text-xs text-violet-300">
              Conecte sua conta para ver conteudos salvos
            </p>
          </div>

          {showEmptyState ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                Voce ainda nao criou nenhum conteudo
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                Que tal comecar com um artigo? Nossa IA escreve um texto profissional
                completo em apenas 30 segundos!
              </p>
              <GlowButton
                size="lg"
                onClick={() => {
                  resetForm()
                  setSelectedCard(actionCards[0])
                }}
              >
                <Sparkles className="h-5 w-5" />
                Criar Meu Primeiro Conteudo
              </GlowButton>
            </motion.div>
          ) : (
            /* Content list */
            <div className="space-y-3">
              {contents.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          typeStyles[item.type]
                        )}
                      >
                        {item.type}
                      </span>
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          statusStyles[item.status]
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Usage Meter */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={5}
      >
        <GlassCard className="p-6" hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-medium text-slate-600">
                Voce usou{" "}
                <span className="text-slate-900 font-bold text-base">
                  {usedContent}
                </span>{" "}
                de{" "}
                <span className="text-slate-900 font-bold text-base">
                  {totalContent}
                </span>{" "}
                conteudos este mes
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {remaining > 0 ? (
                  <>
                    Ainda restam{" "}
                    <span className="text-emerald-400 font-medium">{remaining} conteudos</span>{" "}
                    para criar este mes
                  </>
                ) : (
                  <span className="text-amber-400">
                    Voce atingiu o limite do plano gratuito este mes
                  </span>
                )}
              </p>
            </div>
            <Link href="/precos">
              <GlowButton size="sm" variant="secondary">
                <Zap className="h-3.5 w-3.5" />
                Upgrade para Pro
                <ArrowRight className="h-3.5 w-3.5" />
              </GlowButton>
            </Link>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-50">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                usagePercent >= 90
                  ? "bg-gradient-to-r from-amber-500 via-red-500 to-red-600"
                  : "bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Quer criar conteudo ilimitado? O{" "}
            <Link href="/precos" className="text-violet-600 hover:text-violet-300 underline underline-offset-2">
              plano Pro
            </Link>{" "}
            remove todos os limites e libera recursos exclusivos.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default function ConteudoPage() {
  return <Suspense><ConteudoPageInner /></Suspense>
}
