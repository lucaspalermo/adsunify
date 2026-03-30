"use client"

import { motion } from "framer-motion"
import { Bot, Lightbulb } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function CopilotPreview({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("relative rounded-2xl", className)}
      animate={{
        boxShadow: [
          "0 0 20px -5px rgba(139, 92, 246, 0.15)",
          "0 0 30px -5px rgba(59, 130, 246, 0.2)",
          "0 0 20px -5px rgba(139, 92, 246, 0.15)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Gradient border wrapper */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500/30 to-blue-500/30 p-px">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
              <Bot className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Co-Piloto IA
              </span>
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                <span className="text-[10px] font-medium text-green-400">
                  Online
                </span>
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400">
                Sugestão
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
              Percebi que seu concorrente &apos;MarketingPro&apos; publicou um
              novo artigo sobre &apos;SEO para iniciantes&apos;. Quer que eu
              crie um artigo melhor?
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/copilot"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Criar Artigo
            </Link>
            <Link
              href="/copilot"
              className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400 transition-colors hover:border-slate-300 hover:text-slate-900 dark:text-zinc-100"
            >
              Ver Mais
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CopilotPreview
