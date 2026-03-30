"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  BookOpen,
  Zap,
  Footprints,
  Lock,
  Trophy,
  Target,
  TrendingUp,
  Award,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { cn } from "@/lib/utils"

/* ---------- types & data ---------- */

type Difficulty = "easy" | "medium" | "hard" | "legendary" | "completed"

interface Mission {
  id: number
  difficulty: Difficulty
  title: string
  description: string
  why: string
  xp: number
  current: number
  target: number
  cta: string
  ctaHref?: string
  expiresIn?: string
  estimatedTime?: string
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; subtitle: string; emoji: string; color: string; bg: string; border: string; glow?: string }
> = {
  easy: {
    label: "FACIL",
    subtitle: "Rapido e simples",
    emoji: "\u2705",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  medium: {
    label: "MEDIO",
    subtitle: "Um pouco mais de esforco",
    emoji: "\u26a0\ufe0f",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  hard: {
    label: "DIFICIL",
    subtitle: "Desafio da semana",
    emoji: "\ud83d\udd25",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  legendary: {
    label: "LENDARIO",
    subtitle: "Para os corajosos!",
    emoji: "\ud83d\udc8e",
    color: "text-purple-300",
    bg: "bg-purple-500/15",
    border: "border-purple-400/30",
    glow: "rgba(168, 85, 247, 0.25)",
  },
  completed: {
    label: "COMPLETADA",
    subtitle: "Missao cumprida!",
    emoji: "\u2b50",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
}

const missions: Mission[] = []

interface Badge {
  icon: typeof Star
  name: string
  rarity: "common" | "rare" | "legendary"
  date?: string
  unlocked: boolean
  unlockRequirement?: string
}

const badges: Badge[] = [
  { icon: Footprints, name: "Primeiro Passo", rarity: "common", unlocked: false, unlockRequirement: "Configure sua conta para desbloquear" },
  { icon: BookOpen, name: "Escritor Iniciante", rarity: "common", unlocked: false, unlockRequirement: "Publique seu primeiro conteudo" },
  { icon: Star, name: "Curioso", rarity: "rare", unlocked: false, unlockRequirement: "Leia 10 termos no glossario" },
  { icon: Zap, name: "Raio", rarity: "rare", unlocked: false, unlockRequirement: "Complete 5 missoes em uma semana" },
  { icon: Trophy, name: "Mestre das Missoes", rarity: "legendary", unlocked: false, unlockRequirement: "Complete 10 missoes para desbloquear" },
  { icon: Award, name: "Sequencia de Fogo", rarity: "rare", unlocked: false, unlockRequirement: "Mantenha uma sequencia de 7 dias" },
  { icon: Target, name: "Mira Perfeita", rarity: "legendary", unlocked: false, unlockRequirement: "Complete todas as missoes de uma semana" },
  { icon: TrendingUp, name: "Em Ascensao", rarity: "common", unlocked: false, unlockRequirement: "Alcance o nivel 10" },
]

const tabs = ["Ativas", "Completadas", "Expiradas"] as const
type Tab = (typeof tabs)[number]

/* streak data */
const streakDays = 0
const streakRecord = 0
const last7Days = [false, false, false, false, false, false, false]

/* ---------- components ---------- */

function PulsingProgressBar({ percent, color, height = "h-3" }: { percent: number; color: string; height?: string }) {
  return (
    <div className={cn(height, "w-full overflow-hidden rounded-full bg-slate-50")}>
      <motion.div
        className={cn("h-full rounded-full relative", color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      >
        {/* subtle pulse overlay */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  )
}

function StreakCalendar({ days }: { days: boolean[] }) {
  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]
  return (
    <div className="flex items-center gap-2">
      {days.map((active, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-slate-400">{dayLabels[i]}</span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 * i, type: "spring", stiffness: 300 }}
            className={cn(
              "h-4 w-4 rounded-full border-2 transition-colors",
              active
                ? "bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                : "bg-transparent border-gray-600"
            )}
          />
        </div>
      ))}
    </div>
  )
}

function CompletedCelebration({ xp }: { xp: number }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
    >
      <motion.div
        className="relative"
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        {/* confetti-like particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              background: ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#38bdf8", "#e879f9"][i],
              top: "50%",
              left: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: [0, (Math.cos((i * Math.PI) / 3) * 30)],
              y: [0, (Math.sin((i * Math.PI) / 3) * 30)],
              opacity: [1, 0],
            }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
          />
        ))}
      </motion.div>
      <div>
        <p className="text-sm font-bold text-emerald-400">+{xp} XP conquistados!</p>
        <p className="text-xs text-slate-500">Parabens! Voce completou esta missao</p>
      </div>
    </motion.div>
  )
}

function MissionCard({ mission, index }: { mission: Mission; index: number }) {
  const d = difficultyConfig[mission.difficulty]
  const percent = Math.round((mission.current / mission.target) * 100)
  const isCompleted = mission.difficulty === "completed"

  const progressColor =
    mission.difficulty === "easy"
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : mission.difficulty === "medium"
        ? "bg-gradient-to-r from-amber-500 to-amber-400"
        : mission.difficulty === "hard"
          ? "bg-gradient-to-r from-orange-500 to-red-400"
          : mission.difficulty === "legendary"
            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400"
            : "bg-gradient-to-r from-violet-500 to-violet-400"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <GlassCard
        hover={!isCompleted}
        glow={mission.difficulty === "legendary"}
        glowColor={d.glow}
        className={cn("p-5", isCompleted && "border-emerald-500/20 bg-emerald-500/[0.03]")}
      >
        {/* completed celebration */}
        {isCompleted && (
          <div className="mb-4">
            <CompletedCelebration xp={mission.xp} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* left */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                  d.bg,
                  d.border,
                  d.color,
                  "border"
                )}
              >
                {d.emoji} {d.label}
              </span>
              <span className="text-[10px] text-slate-400 italic">{d.subtitle}</span>
              <span className="text-xs font-bold text-violet-600">+{mission.xp} XP</span>
              {mission.estimatedTime && !isCompleted && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {mission.estimatedTime}
                </span>
              )}
            </div>

            <h3
              className={cn(
                "text-base font-semibold text-slate-900",
                isCompleted && "line-through decoration-white/30"
              )}
            >
              {mission.title}
            </h3>
            <p className="text-sm text-slate-500">{mission.description}</p>

            {/* why it matters */}
            {!isCompleted && (
              <div className="rounded-lg bg-violet-500/[0.07] border border-violet-500/10 px-3 py-2">
                <p className="text-xs text-violet-300">
                  <span className="font-bold">Por que?</span> {mission.why}
                </p>
              </div>
            )}

            {/* progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {mission.current}/{mission.target}
                </span>
                <span className={cn("font-semibold", isCompleted ? "text-emerald-400" : "text-slate-900")}>
                  {percent}% completo
                </span>
              </div>
              <PulsingProgressBar percent={percent} color={progressColor} height="h-2.5" />
            </div>
          </div>

          {/* right */}
          <div className="flex flex-col items-end gap-3 sm:ml-4">
            {!isCompleted && mission.cta && (
              <GlowButton
                variant="primary"
                size="md"
                className="whitespace-nowrap text-sm"
              >
                {mission.cta}
              </GlowButton>
            )}
            {mission.expiresIn && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {mission.expiresIn}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ---------- page ---------- */

export default function MissoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Ativas")

  const currentXP = 0
  const nextLevelXP = 500
  const xpPercent = (currentXP / nextLevelXP) * 100
  const xpRemaining = nextLevelXP - currentXP

  const filteredMissions =
    activeTab === "Ativas"
      ? missions.filter((m) => m.difficulty !== "completed")
      : activeTab === "Completadas"
        ? missions.filter((m) => m.difficulty === "completed")
        : []

  const weeklyMissionCount = missions.filter((m) => m.difficulty !== "completed").length
  const completedCount = missions.filter((m) => m.difficulty === "completed").length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText>Missoes da Semana</GradientText>
        </h1>
      </motion.div>

      {/* explanation banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <GlassCard hover={false} className="p-5 border-violet-500/15">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{"\ud83c\udfaf"}</span>
            <div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900">Missoes sao tarefas semanais que ensinam voce a crescer no marketing digital.</span>{" "}
                Complete missoes para ganhar XP, subir de nivel e desbloquear novas funcionalidades!
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Voce nao precisa saber nada de marketing. Nos te guiamos passo a passo!
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* streak counter + XP row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* streak card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard hover={false} className="p-5 h-full">
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-6 w-6 text-orange-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {streakDays} dias seguidos!
                </h3>
                <p className="text-xs text-slate-400">Comece completando missoes para criar sua sequencia!</p>
              </div>
            </div>

            <div className="mb-3">
              <StreakCalendar days={last7Days} />
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-slate-500">
                Recorde pessoal: <span className="font-semibold text-slate-400">{streakRecord} dias</span>
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* XP progress card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard hover={false} glow glowColor="rgba(139, 92, 246, 0.12)" className="p-5 h-full">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-6 w-6 text-violet-600" />
              <h3 className="text-lg font-bold">
                <GradientText>Nivel 1: Iniciante</GradientText>
              </h3>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Progresso do nivel</span>
              <span className="text-sm text-slate-500">
                <AnimatedCounter value={currentXP} className="font-bold text-slate-900" /> /{" "}
                {nextLevelXP.toLocaleString("pt-BR")} XP
              </span>
            </div>

            <PulsingProgressBar
              percent={xpPercent}
              color="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400"
            />

            <div className="mt-3 space-y-1.5">
              <p className="text-sm font-medium text-slate-500">
                Complete missoes para ganhar XP e subir de nivel!
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-violet-500/[0.08] px-3 py-2 border border-violet-500/10">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs text-slate-600">
                  No nivel 2 voce desbloqueia: <span className="font-semibold text-cyan-300">Missoes Personalizadas</span>
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-white text-slate-400 border border-slate-200 hover:text-slate-600"
            )}
          >
            {tab}
            {tab === "Ativas" && (
              <span className="ml-1.5 text-xs opacity-60">({weeklyMissionCount})</span>
            )}
            {tab === "Completadas" && (
              <span className="ml-1.5 text-xs opacity-60">({completedCount})</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* missions list */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredMissions.length > 0 ? (
            filteredMissions.map((m, i) => <MissionCard key={m.id} mission={m} index={i} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <p className="text-sm text-slate-400">
                {activeTab === "Ativas"
                  ? "Suas missoes semanais serao geradas automaticamente. Volte na segunda-feira!"
                  : activeTab === "Expiradas"
                    ? "Nenhuma missao expirada. Continue assim! \ud83c\udf89"
                    : "Nenhuma missao nesta categoria."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* weekly bonus tip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard hover={false} className="p-4 border-amber-500/15 bg-amber-500/[0.03]">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">{"\ud83d\udca1"}</span>
            <p className="text-sm text-amber-200/90">
              <span className="font-bold">Dica:</span> Complete todas as {weeklyMissionCount} missoes da semana para ganhar um bonus de{" "}
              <span className="font-bold text-amber-300">500 XP</span>! Isso e quase um nivel inteiro!
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* badges section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-slate-900">Suas Conquistas</h2>
          <span className="text-xs text-slate-400 ml-1">
            ({badges.filter((b) => b.unlocked).length}/{badges.length} desbloqueadas)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
            >
              <GlassCard
                hover={badge.unlocked}
                glow={badge.unlocked && badge.rarity !== "common"}
                glowColor={
                  badge.rarity === "legendary"
                    ? "rgba(234, 179, 8, 0.2)"
                    : badge.rarity === "rare"
                      ? "rgba(139, 92, 246, 0.15)"
                      : undefined
                }
                className={cn(
                  "flex flex-col items-center gap-2 p-4 text-center relative",
                  !badge.unlocked && "opacity-50"
                )}
              >
                {/* lock overlay for locked badges */}
                {!badge.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-slate-400" />
                  </div>
                )}

                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full relative",
                    badge.unlocked
                      ? badge.rarity === "legendary"
                        ? "bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border border-amber-400/40"
                        : badge.rarity === "rare"
                          ? "bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/30"
                          : "bg-slate-100 border border-slate-200"
                      : "bg-slate-50 border border-slate-200"
                  )}
                >
                  {/* subtle glow animation for unlocked non-common */}
                  {badge.unlocked && badge.rarity !== "common" && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-full",
                        badge.rarity === "legendary"
                          ? "bg-amber-400/20"
                          : "bg-violet-400/20"
                      )}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <badge.icon
                    className={cn(
                      "h-5 w-5 relative z-10",
                      badge.unlocked
                        ? badge.rarity === "legendary"
                          ? "text-amber-400"
                          : badge.rarity === "rare"
                            ? "text-violet-600"
                            : "text-slate-600"
                        : "text-slate-400"
                    )}
                  />
                </div>

                <span className={cn(
                  "text-xs font-semibold",
                  badge.unlocked ? "text-slate-900" : "text-slate-400"
                )}>
                  {badge.name}
                </span>

                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                    badge.rarity === "legendary"
                      ? "bg-amber-500/20 text-amber-300"
                      : badge.rarity === "rare"
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-slate-50 text-slate-400"
                  )}
                >
                  {badge.rarity === "legendary" ? "Lendario" : badge.rarity === "rare" ? "Raro" : "Comum"}
                </span>

                {badge.unlocked && badge.date ? (
                  <span className="text-[10px] text-slate-400">{badge.date}</span>
                ) : (
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {badge.unlockRequirement}
                  </span>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* bottom motivational */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="pb-8 text-center"
      >
        <p className="text-sm text-slate-400">
          Voce ja completou <span className="font-semibold text-violet-600">{completedCount}</span> missao nesta semana.{" "}
          Continue assim, cada passo conta! {"\ud83d\udcaa"}
        </p>
      </motion.div>
    </div>
  )
}
