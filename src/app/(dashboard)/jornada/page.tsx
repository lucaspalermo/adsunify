"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import {
  Lock,
  Check,
  Trophy,
  Target,
  Star,
  Flame,
  FileText,
  Award,
  Sparkles,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"

/* ---------- data ---------- */

type MilestoneStatus = "completed" | "current" | "locked"

interface Milestone {
  id: number
  name: string
  description: string
  xp: number
  status: MilestoneStatus
}

const milestones: Milestone[] = [
  { id: 1, name: "Primeiro Passo", description: "Configure sua conta", xp: 0, status: "current" },
  { id: 2, name: "Explorador", description: "Complete 5 missões", xp: 500, status: "locked" },
  { id: 3, name: "Aprendiz", description: "Publique 3 conteúdos", xp: 1000, status: "locked" },
  { id: 4, name: "Estrategista", description: "Health Score 80+", xp: 2500, status: "locked" },
  { id: 5, name: "Especialista", description: "10 palavras no Top 10", xp: 5000, status: "locked" },
  { id: 6, name: "Mestre", description: "50 conteúdos + 25 palavras Top 10", xp: 10000, status: "locked" },
]

const currentRequirements = [
  { label: "Complete seu perfil de negócio", current: 0, target: 1, done: false },
  { label: "Adicione sua primeira palavra-chave", current: 0, target: 1, done: false },
  { label: "Crie seu primeiro conteúdo", current: 0, target: 1, done: false },
  { label: "Leia 3 termos no Glossário", current: 0, target: 3, done: false },
]

const rewards = ["Badge Primeiro Passo", "Acesso ao Co-Piloto", "Missões Semanais"]

const stats = [
  { label: "Total XP", value: 0, icon: Star },
  { label: "Missões completadas", value: 0, icon: Target },
  { label: "Conteúdos criados", value: 0, icon: FileText },
  { label: "Dias de sequência", value: 0, icon: Flame },
  { label: "Badges conquistados", value: 0, icon: Award, suffix: "/20" },
]

/* ---------- SVG path roadmap ---------- */

function JourneyRoadmap() {
  // We define a winding path from bottom-left to top-right
  const pathD =
    "M 60 520 C 150 520, 200 420, 250 380 S 400 340, 450 280 S 550 200, 500 160 S 400 100, 500 60 S 650 20, 740 40"

  // Node positions along the path (approximate)
  const nodePositions = [
    { x: 60, y: 520 },
    { x: 250, y: 380 },
    { x: 450, y: 280 },
    { x: 500, y: 160 },
    { x: 500, y: 60 },
    { x: 740, y: 40 },
  ]

  // The current node is index 0 (Primeiro Passo), so the path is at the very beginning
  const completedFraction = 0.05

  const pathLength = useMotionValue(0)

  useEffect(() => {
    animate(pathLength, 1, { duration: 2, ease: "easeInOut" })
  }, [pathLength])

  const dashProgress = useTransform(pathLength, [0, 1], [0, completedFraction])

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox="0 0 800 560"
        className="mx-auto h-auto w-full max-w-3xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* background dashed path */}
        <path
          d={pathD}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="4"
          strokeDasharray="12 8"
          fill="none"
        />

        {/* colored animated path */}
        <motion.path
          d={pathD}
          stroke="url(#pathGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: completedFraction }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* milestone nodes */}
        {milestones.map((m, i) => {
          const pos = nodePositions[i]
          const isCompleted = m.status === "completed"
          const isCurrent = m.status === "current"
          const isLocked = m.status === "locked"

          return (
            <g key={m.id}>
              {/* glow for current */}
              {isCurrent && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="28"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity={0.4}
                  animate={{ r: [28, 36, 28], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isCurrent ? 22 : 16}
                fill={
                  isCompleted
                    ? "#22c55e"
                    : isCurrent
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.08)"
                }
                stroke={
                  isCompleted
                    ? "#16a34a"
                    : isCurrent
                      ? "#2563eb"
                      : "rgba(255,255,255,0.12)"
                }
                strokeWidth="2"
                opacity={isLocked ? 0.5 : 1}
              />

              {/* icon text */}
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isCurrent ? "14" : "11"}
                fill="white"
                fontWeight="bold"
              >
                {isCompleted ? "✓" : isCurrent ? "★" : "🔒"}
              </text>

              {/* label */}
              <text
                x={pos.x}
                y={pos.y + (isCurrent ? 40 : 32)}
                textAnchor="middle"
                fontSize="11"
                fill={isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)"}
                fontWeight="600"
              >
                {m.name}
              </text>
              <text
                x={pos.x}
                y={pos.y + (isCurrent ? 54 : 46)}
                textAnchor="middle"
                fontSize="9"
                fill={isLocked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.4)"}
              >
                {m.xp > 0 ? `${m.xp.toLocaleString("pt-BR")} XP` : "Início"}
              </text>
            </g>
          )
        })}

        {/* avatar at current position */}
        <motion.g
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle
            cx={nodePositions[0].x}
            cy={nodePositions[0].y - 35}
            r="10"
            fill="#8b5cf6"
            stroke="#a78bfa"
            strokeWidth="2"
          />
          <text
            x={nodePositions[0].x}
            y={nodePositions[0].y - 34}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
          >
            🧑
          </text>
        </motion.g>
      </svg>
    </div>
  )
}

/* ---------- page ---------- */

export default function JornadaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            <GradientText>Sua Jornada</GradientText>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe sua evolução como profissional de marketing</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2 border border-blue-500/20">
          <Trophy className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">Nível 1: Iniciante</span>
        </div>
      </motion.div>

      {/* roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <GlassCard hover={false} className="p-6">
          <JourneyRoadmap />
        </GlassCard>
      </motion.div>

      {/* bottom section: detail + stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* current milestone detail */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassCard
            hover={false}
            glow
            glowColor="rgba(59, 130, 246, 0.15)"
            className="p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Nível Atual: Iniciante</h2>
                <p className="text-xs text-slate-500">Complete os requisitos para avançar</p>
              </div>
            </div>

            {/* requirements */}
            <div className="space-y-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Requisitos
              </span>
              {currentRequirements.map((req, i) => (
                <motion.div
                  key={req.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded",
                      req.done
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-50 text-slate-400"
                    )}
                  >
                    {req.done ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-sm border border-gray-600" />
                    )}
                  </div>
                  <span className={cn("text-sm", req.done ? "text-slate-600" : "text-slate-900 font-medium")}>
                    {req.label}
                  </span>
                  <span className="ml-auto text-xs text-slate-400">
                    {req.current}/{req.target}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* rewards */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Recompensas ao completar
              </span>
              <div className="flex flex-wrap gap-2">
                {rewards.map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/20"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* stats sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard hover={false} className="p-6 space-y-5">
            <h3 className="text-base font-semibold text-slate-900">Seu Progresso</h3>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-violet-600" />
                    <span className="text-sm text-slate-500">{stat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix ?? ""}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
