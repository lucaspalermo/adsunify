"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/shared/glass-card"

interface Activity {
  description: string
  time: string
  dotColor: string
}

const activities: Activity[] = [
  {
    description: "Missão completada: Publique 1 artigo",
    time: "2h atrás",
    dotColor: "bg-green-400",
  },
  {
    description: "Seu ranking subiu: 'marketing digital' posição 15 → 12",
    time: "5h atrás",
    dotColor: "bg-blue-400",
  },
  {
    description: "Novo badge conquistado: Primeira Missão",
    time: "1 dia",
    dotColor: "bg-purple-400",
  },
  {
    description: "Co-Piloto sugeriu: Otimizar meta description da home",
    time: "1 dia",
    dotColor: "bg-cyan-400",
  },
  {
    description: "Health Score atualizado: 65 → 73",
    time: "2 dias",
    dotColor: "bg-green-400",
  },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export function ActivityFeed({ className }: { className?: string }) {
  return (
    <GlassCard hover={false} className={cn("p-6", className)}>
      <h3 className="mb-5 text-base font-semibold text-slate-900 dark:text-zinc-100">
        Atividade Recente
      </h3>

      <motion.div
        className="space-y-0"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            variants={item}
            className="relative flex gap-4 pb-5 last:pb-0"
          >
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-[7px] top-5 h-full w-px bg-slate-50" />
            )}

            {/* Dot */}
            <div className="relative z-10 mt-1.5 flex shrink-0">
              <span
                className={cn(
                  "h-[14px] w-[14px] rounded-full border-2 border-[#f8f9fc]",
                  activity.dotColor
                )}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                {activity.description}
              </p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  )
}

export default ActivityFeed
