"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Flame, CheckCircle2, Clock, Star, Zap, Target, Trophy, Loader2, ArrowRight,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Mission {
  id: string
  title: string
  description: string
  xpReward: number
  type: string
  status: string
  progress: number
  target: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string | null
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
}

export default function MissoesPage() {
  const userId = useUserId()
  const [missions, setMissions] = useState<Mission[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"ativas" | "completadas">("ativas")
  const [streakDays, setStreakDays] = useState(0)
  const [totalXp, setTotalXp] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const [missionsRes, badgesRes, userRes] = await Promise.all([
          fetch(`/api/missions?userId=${userId}`).then(r => r.json()).catch(() => []),
          fetch(`/api/badges?userId=${userId}`).then(r => r.json()).catch(() => []),
          fetch(`/api/user?userId=${userId}`).then(r => r.json()).catch(() => ({})),
        ])
        setMissions(Array.isArray(missionsRes) ? missionsRes : missionsRes.missions || [])
        setBadges(Array.isArray(badgesRes) ? badgesRes : badgesRes.badges || [])
        setStreakDays(userRes.streakDays || 0)
        setTotalXp(userRes.xp || 0)
        setLevel(userRes.level || 1)
      } catch {}
      setLoading(false)
    }
    load()
  }, [userId])

  const activeMissions = missions.filter(m => m.status === "ACTIVE")
  const completedMissions = missions.filter(m => m.status === "COMPLETED")
  const displayMissions = tab === "ativas" ? activeMissions : completedMissions

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Missoes</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Complete missoes pra ganhar XP, subir de nivel e desbloquear funcionalidades
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard className="p-4 text-center">
          <Flame className="mx-auto h-6 w-6 text-orange-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{streakDays}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Dias seguidos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Zap className="mx-auto h-6 w-6 text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{totalXp.toLocaleString()}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">XP Total</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Target className="mx-auto h-6 w-6 text-indigo-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{completedMissions.length}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Missoes completas</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Trophy className="mx-auto h-6 w-6 text-violet-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Nivel {level}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{badges.filter(b => b.earnedAt).length} badges</p>
        </GlassCard>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="flex gap-2">
        {(["ativas", "completadas"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            tab === t ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
          )}>
            {t === "ativas" ? `Ativas (${activeMissions.length})` : `Completas (${completedMissions.length})`}
          </button>
        ))}
      </motion.div>

      {/* Missions list */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
        {displayMissions.length === 0 ? (
          <GlassCard className="p-8 text-center" hover={false}>
            <Target className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">
              {tab === "ativas" ? "Nenhuma missao ativa no momento" : "Nenhuma missao completada ainda"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
              {tab === "ativas" ? "Continue usando o sistema — novas missoes aparecem toda semana" : "Complete suas primeiras missoes pra ganhar XP"}
            </p>
            <Link href="/painel">
              <GlowButton size="sm"><ArrowRight className="h-4 w-4" /> Ir pro Dashboard</GlowButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {displayMissions.map((mission, i) => (
              <motion.div key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {mission.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{mission.title}</span>
                      </div>
                      {mission.description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 ml-6">{mission.description}</p>
                      )}
                      {/* Progress bar */}
                      {mission.status === "ACTIVE" && mission.target > 0 && (
                        <div className="mt-2 ml-6 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                              style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400">{mission.progress}/{mission.target}</span>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-violet-500" /> Seus Badges
            </h3>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {badges.map(badge => (
                <div key={badge.id} className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-center",
                  badge.earnedAt
                    ? "border-violet-200 dark:border-violet-800 bg-violet-500/5"
                    : "border-slate-100 dark:border-zinc-800 opacity-40"
                )}>
                  <span className="text-2xl">{badge.icon || "🏆"}</span>
                  <span className="text-[10px] font-medium text-slate-700 dark:text-zinc-300 leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
