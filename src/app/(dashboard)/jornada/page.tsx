"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Map, Star, Zap, Target, Trophy, CheckCircle2, Lock, Loader2, Flame } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

const milestones = [
  { level: 1, title: "Primeiro Passo", xpRequired: 0, icon: "🌱", description: "Voce comecou sua jornada no marketing digital" },
  { level: 2, title: "Explorador", xpRequired: 200, icon: "🧭", description: "Ja sabe o basico e esta explorando as ferramentas" },
  { level: 3, title: "Estrategista", xpRequired: 500, icon: "🎯", description: "Voce entende estrategias e sabe o que funciona" },
  { level: 4, title: "Especialista", xpRequired: 1200, icon: "⚡", description: "Domina varias areas do marketing digital" },
  { level: 5, title: "Mestre", xpRequired: 2500, icon: "👑", description: "Voce e referencia — sabe criar e otimizar campanhas" },
  { level: 6, title: "Lenda", xpRequired: 5000, icon: "🏆", description: "Top 1% dos usuarios — marketing nao tem segredos pra voce" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
}

export default function JornadaPage() {
  const userId = useUserId()
  const [loading, setLoading] = useState(true)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [streakDays, setStreakDays] = useState(0)
  const [completedMissions, setCompletedMissions] = useState(0)
  const [contentCount, setContentCount] = useState(0)
  const [keywordCount, setKeywordCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const [userRes, missionsRes, contentRes, kwRes] = await Promise.all([
          fetch(`/api/user?userId=${userId}`).then(r => r.json()).catch(() => ({})),
          fetch(`/api/missions?userId=${userId}`).then(r => r.json()).catch(() => []),
          fetch(`/api/content?userId=${userId}`).then(r => r.json()).catch(() => ({ monthlyCount: 0 })),
          fetch(`/api/seo/keywords?userId=${userId}`).then(r => r.json()).catch(() => []),
        ])
        setXp(userRes.xp || 0)
        setLevel(userRes.level || 1)
        setStreakDays(userRes.streakDays || 0)
        const mList = Array.isArray(missionsRes) ? missionsRes : missionsRes.missions || []
        setCompletedMissions(mList.filter((m: any) => m.status === "COMPLETED").length)
        setContentCount(contentRes.monthlyCount || contentRes.contents?.length || 0)
        setKeywordCount(Array.isArray(kwRes) ? kwRes.length : 0)
      } catch {}
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  }

  const currentMilestone = milestones.filter(m => xp >= m.xpRequired).pop() || milestones[0]
  const nextMilestone = milestones.find(m => m.xpRequired > xp)
  const progressToNext = nextMilestone ? ((xp - currentMilestone.xpRequired) / (nextMilestone.xpRequired - currentMilestone.xpRequired)) * 100 : 100

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Sua Jornada</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Veja como voce esta evoluindo no marketing digital
        </p>
      </motion.div>

      {/* Current Level */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
        <GlassCard className="p-6" hover={false}>
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-2">{currentMilestone.icon}</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Nivel {currentMilestone.level}: {currentMilestone.title}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{currentMilestone.description}</p>
            {nextMilestone && (
              <div className="w-full max-w-md mt-6">
                <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1.5">
                  <span>{xp.toLocaleString()} XP</span>
                  <span>{nextMilestone.xpRequired.toLocaleString()} XP pra {nextMilestone.title}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, progressToNext)}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 text-center">Faltam {(nextMilestone.xpRequired - xp).toLocaleString()} XP</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Dias seguidos", value: streakDays, icon: Flame, color: "text-orange-500" },
          { label: "Missoes feitas", value: completedMissions, icon: Target, color: "text-indigo-500" },
          { label: "Conteudos", value: contentCount, icon: Star, color: "text-amber-500" },
          { label: "Keywords", value: keywordCount, icon: Zap, color: "text-cyan-500" },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 text-center">
            <s.icon className={cn("mx-auto h-5 w-5 mb-1", s.color)} />
            <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{s.value}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{s.label}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Roadmap */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Map className="h-4 w-4 text-indigo-500" /> Mapa da Jornada
          </h3>
          <div className="space-y-3">
            {milestones.map((m, i) => {
              const isReached = xp >= m.xpRequired
              const isCurrent = m.level === currentMilestone.level
              return (
                <motion.div key={m.level} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className={cn("flex items-center gap-4 rounded-xl border p-4", isCurrent ? "border-indigo-500/30 bg-indigo-500/5 ring-1 ring-indigo-500/20" : isReached ? "border-green-500/20 bg-green-500/5" : "border-slate-100 dark:border-zinc-800 opacity-50")}>
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{m.title}</span>
                      {isReached ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      {isCurrent && <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">VOCE ESTA AQUI</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{m.description}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 shrink-0">{m.xpRequired.toLocaleString()} XP</span>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
