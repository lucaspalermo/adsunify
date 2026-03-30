"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Layout, Loader2, Download, Eye, Wand2, Code } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"

export default function LandingPagesPage() {
  const userId = useUserId()
  const [businessName, setBusinessName] = useState("")
  const [product, setProduct] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [style, setStyle] = useState("moderno")
  const [generating, setGenerating] = useState(false)
  const [html, setHtml] = useState("")
  const [showCode, setShowCode] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  async function generateLP() {
    if (!businessName.trim() || !userId) return
    setGenerating(true)
    setHtml("")
    try {
      const res = await fetch("/api/ai/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, product, targetAudience, style, userId }),
      })

      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let fullHtml = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const json = JSON.parse(line.slice(6))
              fullHtml += json.text
            } catch {}
          }
        }
      }

      // Extract HTML between tags
      const htmlMatch = fullHtml.match(/<!DOCTYPE[\s\S]*<\/html>/i)
      setHtml(htmlMatch ? htmlMatch[0] : fullHtml)
    } catch {}
    setGenerating(false)
  }

  function downloadHTML() {
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-landing-page.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">AI Landing Page Builder</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Gere landing pages completas com IA — HTML + Tailwind CSS, pronta pra usar
        </p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-5" hover={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Nome do negocio *</label>
              <input
                type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Studio Fitness Premium"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Produto/Servico</label>
              <input
                type="text" value={product} onChange={(e) => setProduct(e.target.value)}
                placeholder="Ex: Plano de treino personalizado"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Publico-alvo</label>
              <input
                type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: Mulheres 25-45 anos"
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Estilo</label>
              <select
                value={style} onChange={(e) => setStyle(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50"
              >
                <option value="moderno">Moderno e minimalista</option>
                <option value="ousado">Ousado e vibrante</option>
                <option value="elegante">Elegante e sofisticado</option>
                <option value="divertido">Divertido e colorido</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <GlowButton onClick={generateLP} disabled={generating || !businessName.trim()}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {generating ? "Gerando landing page..." : "Gerar Landing Page com IA"}
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Preview */}
      {html && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-500" /> Preview
              </h3>
              <div className="flex items-center gap-2">
                <GlowButton variant="secondary" size="sm" onClick={() => setShowCode(!showCode)}>
                  <Code className="h-3.5 w-3.5" /> {showCode ? "Preview" : "Codigo"}
                </GlowButton>
                <GlowButton size="sm" onClick={downloadHTML}>
                  <Download className="h-3.5 w-3.5" /> Baixar HTML
                </GlowButton>
              </div>
            </div>

            {showCode ? (
              <pre className="max-h-[600px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-green-400 font-mono">
                {html}
              </pre>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  className="w-full h-[600px]"
                  sandbox="allow-scripts"
                  title="Landing Page Preview"
                />
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
