"use client"

import { useState, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Camera, Video, MessageCircle, Mail, Megaphone,
  Sparkles, Copy, Loader2, CheckCircle, X, Calendar, Wand2,
} from "lucide-react"
import { useUserId } from "@/hooks/use-user-id"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

const channels = [
  { id: "blog", label: "Blog / Artigo", icon: FileText, color: "from-blue-500 to-cyan-500", desc: "Artigo completo otimizado pro Google" },
  { id: "instagram", label: "Instagram", icon: Camera, color: "from-pink-500 to-purple-500", desc: "Post, carrossel ou reel com legenda" },
  { id: "tiktok", label: "TikTok / Reels", icon: Video, color: "from-red-500 to-pink-500", desc: "Roteiro de video curto com hook" },
  { id: "youtube", label: "YouTube", icon: Video, color: "from-red-600 to-red-400", desc: "Roteiro completo com titulo e tags" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "from-green-500 to-emerald-500", desc: "Sequencia de 5 mensagens de vendas" },
  { id: "email", label: "Email Marketing", icon: Mail, color: "from-indigo-500 to-blue-500", desc: "3 emails: boas-vindas, nurture, oferta" },
  { id: "ads", label: "Anuncios (Copy)", icon: Megaphone, color: "from-violet-500 to-purple-500", desc: "Headlines e descricoes pra Google e Meta" },
]

const tones = [
  { id: "profissional", label: "Profissional" },
  { id: "casual", label: "Casual e amigavel" },
  { id: "persuasivo", label: "Persuasivo (vender)" },
  { id: "educativo", label: "Educativo (ensinar)" },
  { id: "divertido", label: "Divertido e leve" },
]

function ConteudoContent() {
  const userId = useUserId()
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [tone, setTone] = useState("profissional")
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState("")
  const [copied, setCopied] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendar, setCalendar] = useState<any>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  async function generate() {
    if (!selectedChannel || !topic.trim() || !userId) return
    setGenerating(true)
    setResult("")
    try {
      const res = await fetch("/api/ai/content/multichannel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: selectedChannel, topic, keywords, tone, userId }),
      })
      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const json = JSON.parse(line.slice(6))
              full += json.text
              setResult(full)
            } catch {}
          }
        }
      }
    } catch {}
    setGenerating(false)
  }

  async function generateCalendar() {
    if (!userId) return
    setCalendarLoading(true)
    try {
      const res = await fetch("/api/ai/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, niche: "", goals: "", keywords: "" }),
      })
      const data = await res.json()
      setCalendar(data)
    } catch {}
    setCalendarLoading(false)
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
              <GradientText as="span">Criar Conteudo</GradientText>
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Escolha onde voce quer publicar e a IA cria o conteudo completo pra voce
            </p>
          </div>
          <GlowButton variant="secondary" onClick={() => { setShowCalendar(true); if (!calendar) generateCalendar(); }}>
            <Calendar className="h-4 w-4" />
            Calendario do Mes
          </GlowButton>
        </div>
      </motion.div>

      {/* Channel Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">Onde voce quer publicar?</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {channels.map((ch) => (
            <motion.button
              key={ch.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedChannel(ch.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                selectedChannel === ch.id
                  ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10"
                  : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600"
              )}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", ch.color)}>
                <ch.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{ch.label}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 leading-tight">{ch.desc}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Topic + Generate */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="p-5" hover={false}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                    Sobre o que voce quer falar? *
                  </label>
                  <input
                    type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Como escolher o melhor produto para pele oleosa"
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                      Palavras-chave (opcional)
                    </label>
                    <input
                      type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                      placeholder="skincare, pele oleosa, rotina"
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                      Tom de voz
                    </label>
                    <select
                      value={tone} onChange={(e) => setTone(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
                    >
                      {tones.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <GlowButton onClick={generate} disabled={generating || !topic.trim()}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {generating ? "Criando conteudo..." : "Criar com IA"}
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} ref={resultRef}>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" /> Conteudo gerado
              </h3>
              <GlowButton size="sm" variant="secondary" onClick={copyResult}>
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado!" : "Copiar"}
              </GlowButton>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert rounded-xl bg-slate-50 dark:bg-zinc-800/50 p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              {result}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" /> Calendario Editorial
                </h2>
                <button onClick={() => setShowCalendar(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {calendarLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="ml-3 text-sm text-slate-500">A IA esta montando seu calendario...</span>
                </div>
              ) : calendar ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Tema do mes: <span className="font-medium text-slate-700 dark:text-zinc-300">{calendar.theme}</span>
                  </p>
                  {(calendar.weeks || []).map((week: any) => (
                    <div key={week.week} className="rounded-xl border border-slate-100 dark:border-zinc-800 p-4">
                      <p className="text-xs font-semibold text-indigo-500 mb-2">Semana {week.week} — {week.theme}</p>
                      <div className="space-y-2">
                        {(week.posts || []).map((post: any, j: number) => (
                          <div key={j} className="flex items-center gap-3 text-sm">
                            <span className="shrink-0 w-16 text-xs font-medium text-slate-400 capitalize">{post.day}</span>
                            <span className="shrink-0 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500">{post.channel}</span>
                            <span className="text-slate-700 dark:text-zinc-300 truncate">{post.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">Clique em &quot;Calendario do Mes&quot; pra gerar</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ConteudoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <ConteudoContent />
    </Suspense>
  )
}
