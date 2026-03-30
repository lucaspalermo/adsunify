"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Clock, Zap, Star, ChevronRight, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { cn } from "@/lib/utils"

interface CourseTopics { title: string; duration: string; xp: number }
interface Course {
  id: string
  title: string
  description: string
  modules: number
  duration: string
  level: string
  xpReward: number
  badge: string
  topics: CourseTopics[]
}

const levelColors: Record<string, { bg: string; text: string }> = {
  iniciante: { bg: "bg-green-500/10", text: "text-green-500" },
  intermediario: { bg: "bg-amber-500/10", text: "text-amber-500" },
  avancado: { bg: "bg-red-500/10", text: "text-red-500" },
}

export default function AcademyPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("todos")

  useEffect(() => {
    fetch("/api/academy")
      .then(r => r.json())
      .then(data => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === "todos" ? courses : courses.filter(c => c.level === filter)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Academy</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Aprenda marketing digital do zero ao avancado. Ganhe XP e badges ao completar cursos.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <GraduationCap className="mx-auto h-6 w-6 text-indigo-500 mb-1" />
          <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{courses.length}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Cursos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Clock className="mx-auto h-6 w-6 text-violet-500 mb-1" />
          <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">16h</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Conteudo</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Zap className="mx-auto h-6 w-6 text-amber-500 mb-1" />
          <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">{courses.reduce((s, c) => s + c.xpReward, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">XP Total</p>
        </GlassCard>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-2">
        {["todos", "iniciante", "intermediario", "avancado"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === lvl
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
            )}
          >
            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Course List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((course, i) => {
            const colors = levelColors[course.level] || levelColors.iniciante
            const isExpanded = expandedCourse === course.id
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <GlassCard className="p-5" hover={false}>
                  <button onClick={() => setExpandedCourse(isExpanded ? null : course.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">{course.title}</h3>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", colors.bg, colors.text)}>
                            {course.level}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">{course.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400 dark:text-zinc-500">
                          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.modules} modulos</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> +{course.xpReward} XP</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-violet-500" /> Badge: {course.badge}</span>
                        </div>
                      </div>
                      <ChevronRight className={cn("h-5 w-5 text-slate-400 transition-transform shrink-0", isExpanded && "rotate-90")} />
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
                      <div className="space-y-2">
                        {course.topics.map((topic, j) => (
                          <div key={j} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-500">{j + 1}</span>
                              <span className="text-sm text-slate-700 dark:text-zinc-300">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500">
                              <span>{topic.duration}</span>
                              <span className="text-amber-500 font-medium">+{topic.xp} XP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
