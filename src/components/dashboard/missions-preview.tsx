"use client"

import { motion } from "framer-motion"
import { ArrowRight, Flame } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/shared/glass-card"

interface Mission {
  title: string
  difficulty: "FÁCIL" | "MÉDIO" | "DIFÍCIL"
  xp: number
  progress: number
}

const missions: Mission[] = [
  {
    title: "Publique 1 artigo sobre SEO",
    difficulty: "FÁCIL",
    xp: 50,
    progress: 0,
  },
  {
    title: "Adicione 3 palavras-chave para rastrear",
    difficulty: "MÉDIO",
    xp: 100,
    progress: 33,
  },
  {
    title: "Melhore a velocidade do site para 80+",
    difficulty: "DIFÍCIL",
    xp: 200,
    progress: 75,
  },
]

const difficultyColors: Record<Mission["difficulty"], { badge: string; text: string }> = {
  "FÁCIL": { badge: "bg-green-500/15 text-green-400", text: "text-green-400" },
  "MÉDIO": { badge: "bg-amber-500/15 text-amber-400", text: "text-amber-400" },
  "DIFÍCIL": { badge: "bg-red-500/15 text-red-400", text: "text-red-400" },
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export function MissionsPreview({ className }: { className?: string }) {
  return (
    <GlassCard hover={false} className={cn("p-6", className)}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Missões da Semana
        </h3>
        <Link
          href="/missoes"
          className="flex items-center gap-1 text-xs font-medium text-violet-600 transition-colors hover:text-violet-300"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Missions list */}
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {missions.map((mission, index) => {
          const colors = difficultyColors[mission.difficulty]
          return (
            <motion.div
              key={index}
              variants={item}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 leading-snug">
                  {mission.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide",
                    colors.badge
                  )}
                >
                  {mission.difficulty}
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  +{mission.xp} XP
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  {mission.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${mission.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Streak counter */}
      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] py-2.5">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg"
        >
          <Flame className="h-5 w-5 text-amber-400" />
        </motion.span>
        <span className="text-sm font-medium text-amber-300">
          Sequência: 5 dias
        </span>
      </div>
    </GlassCard>
  )
}

export default MissionsPreview
