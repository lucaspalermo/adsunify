"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  FileText,
  Search,
  Lightbulb,
  BarChart3,
  Target,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Settings,
  User,
  Sparkles,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

/* ---------- types ---------- */

interface Message {
  id: number
  role: "assistant" | "user"
  text: string
}

/* ---------- quick action cards data ---------- */

const quickActions = [
  {
    icon: FileText,
    title: "Criar um artigo para meu blog",
    description: "Vou gerar um artigo otimizado para Google",
    message: "Quero criar um artigo para meu blog",
  },
  {
    icon: Search,
    title: "Analisar meu site",
    description: "Vou verificar o SEO do seu site",
    message: "Quero que voce analise o SEO do meu site",
  },
  {
    icon: Lightbulb,
    title: "Me dar ideias de conteudo",
    description: "Vou sugerir temas para seu nicho",
    message: "Me de ideias de conteudo para meu nicho",
  },
  {
    icon: BarChart3,
    title: "Explicar meus resultados",
    description: "Vou analisar seus numeros",
    message: "Quero entender meus resultados e metricas",
  },
  {
    icon: Target,
    title: "Criar texto de anuncio",
    description: "Vou escrever copies para seus ads",
    message: "Preciso de textos para meus anuncios",
  },
  {
    icon: Smartphone,
    title: "Criar post para Instagram",
    description: "Vou criar legendas e ideias de posts",
    message: "Quero criar um post para o Instagram",
  },
]

const actionEmojis = ["📝", "🔍", "💡", "📊", "🎯", "📱"]

/* ---------- suggestion chips ---------- */

const defaultChips = [
  "O que devo fazer primeiro?",
  "Como melhorar meu SEO?",
  "Crie um artigo sobre meu nicho",
]

/* ---------- business context ---------- */

/* ---------- initial messages (empty - no demo) ---------- */

const demoMessages: Message[] = []

/* ---------- typing dots ---------- */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

/* ---------- message bubble ---------- */

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isAssistant = msg.role === "assistant"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
          isAssistant
            ? "bg-slate-50 border border-slate-200 text-slate-700"
            : "bg-gradient-to-r from-violet-600/80 to-blue-600/80 text-white"
        )}
        dangerouslySetInnerHTML={{
          __html: msg.text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
            .replace(/\n/g, "<br/>"),
        }}
      />
      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </motion.div>
  )
}

/* ---------- welcome banner ---------- */

function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard
        hover={false}
        glow
        glowColor="rgba(139, 92, 246, 0.2)"
        className="relative overflow-hidden border-violet-500/20 p-6"
      >
        {/* gradient border accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Ola! Eu sou seu Co-Piloto de Marketing 🤖
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Estou aqui para te ajudar a crescer no digital. Me conta sobre seu
              negocio ou escolha uma opcao abaixo:
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ---------- quick action card ---------- */

function QuickActionCard({
  action,
  emoji,
  index,
  onClick,
}: {
  action: (typeof quickActions)[number]
  emoji: string
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
    >
      <GlassCard
        className="cursor-pointer p-4 transition-colors hover:border-violet-500/30 hover:bg-violet-500/[0.06]"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 leading-snug">
              {action.title}
            </p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ---------- business context bar ---------- */

function BusinessContextBar({ businessCtx }: { businessCtx: { name: string; niche: string; site: string } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard hover={false} className="overflow-hidden">
        {/* collapsed bar */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
            <Sparkles className="h-4 w-4 shrink-0 text-violet-600" />
            <span className="font-medium text-slate-900">{businessCtx.name || "Seu Negocio"}</span>
            <span className="text-slate-400">|</span>
            <span className="truncate">{businessCtx.niche || "Configure nas Configuracoes"}</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          )}
        </button>

        {/* expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Site</span>
                  <span className="text-slate-600">{businessCtx.site || "Nao configurado"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nicho</span>
                  <span className="text-slate-600">{businessCtx.niche || "Nao configurado"}</span>
                </div>
                <a
                  href="/configuracoes"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-300 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Editar
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

/* ---------- page ---------- */

function CopilotPageInner() {
  const searchParams = useSearchParams()
  const msgParam = searchParams.get("msg")
  const userId = useUserId()

  const [messages, setMessages] = useState<Message[]>(demoMessages)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)
  const [businessCtx, setBusinessCtx] = useState({ name: "", niche: "", site: "" })

  useEffect(() => {
    if (userId) {
      fetch(`/api/user?userId=${userId}`)
        .then(r => r.json())
        .then(data => {
          setBusinessCtx({
            name: data.businessName || "",
            niche: data.businessNiche || "",
            site: data.businessUrl || "",
          })
        })
        .catch(() => {})
    }
  }, [userId])

  const chatIsEmpty = messages.length === 0

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, typing])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTyping(true)

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, userId: userId || "demo" }),
      })

      if (!res.ok || !res.body) {
        throw new Error("Erro na resposta")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const assistantId = Date.now() + 1

      // Add empty assistant message that will be streamed into
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }])
      setTyping(false)

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, text: m.text + data.text } : m
                  )
                )
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Desculpe, ocorreu um erro. Tente novamente em alguns segundos.",
        },
      ])
    }
  }, [messages])

  // Auto-send message from query param
  useEffect(() => {
    if (msgParam && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      sendMessage(decodeURIComponent(msgParam))
    }
  }, [msgParam, messages.length, sendMessage])

  const handleSend = () => sendMessage(input)

  const handleQuickAction = (message: string) => sendMessage(message)

  const handleChip = (chip: string) => sendMessage(chip)

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-7xl flex-col gap-4 lg:flex-row lg:gap-6">
      {/* ---- Left panel: quick actions (hidden on mobile) ---- */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden w-full shrink-0 lg:flex lg:w-[340px] lg:flex-col lg:gap-4"
      >
        {/* business context collapsible */}
        <BusinessContextBar businessCtx={businessCtx} />

        {/* quick action cards */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 px-1">
            O que voce quer fazer?
          </p>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, i) => (
              <QuickActionCard
                key={action.title}
                action={action}
                emoji={actionEmojis[i]}
                index={i}
                onClick={() => handleQuickAction(action.message)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ---- Right panel: chat ---- */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        {/* welcome banner (when chat is empty / first time) */}
        <AnimatePresence>
          {chatIsEmpty && <WelcomeBanner />}
        </AnimatePresence>

        <GlassCard hover={false} className="flex flex-1 flex-col overflow-hidden">
          {/* chat header */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Co-Piloto AdsUnify</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                Online
              </div>
            </div>
          </div>

          {/* mobile quick actions (horizontal scroll) */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 lg:hidden scrollbar-none">
            {quickActions.map((action, i) => (
              <button
                key={action.title}
                onClick={() => handleQuickAction(action.message)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
              >
                <span>{actionEmojis[i]}</span>
                <span className="whitespace-nowrap">{action.title}</span>
              </button>
            ))}
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} msg={msg} index={i} />
            ))}
            <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>

            {/* empty state for chat */}
            {chatIsEmpty && !typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 mb-4">
                  <Bot className="h-8 w-8 text-violet-600" />
                </div>
                <p className="text-sm text-slate-400 max-w-xs">
                  Escolha uma opcao ao lado ou digite sua pergunta abaixo para comecar!
                </p>
              </motion.div>
            )}
          </div>

          {/* input area */}
          <div className="border-t border-slate-200 px-4 pb-4 pt-3">
            {/* suggestion chips */}
            <div className="mb-3 flex flex-wrap gap-2">
              {defaultChips.map((c) => (
                <button
                  key={c}
                  onClick={() => handleChip(c)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 transition-colors hover:border-violet-500/40 hover:text-violet-300"
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 backdrop-blur-md focus-within:border-violet-500/40">
              <input
                type="text"
                placeholder="Pergunte ao Co-Piloto..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default function CopilotPage() {
  return <Suspense><CopilotPageInner /></Suspense>
}
