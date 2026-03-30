"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Megaphone,
  Plug,
  DollarSign,
  MousePointerClick,
  Target,
  TrendingDown,
  Lightbulb,
  Check,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { GlowButton } from "@/components/shared/glow-button"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

const campaigns: {
  name: string
  platform: string
  status: string
  spent: string
  clicks: number
  cpa: string
}[] = []

const suggestions: {
  icon: typeof TrendingDown
  text: string
  color: string
}[] = []

export default function AnunciosPage() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [metaConnected, setMetaConnected] = useState(false)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Central de Anúncios</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie seus anúncios do Google e Meta em um só lugar
        </p>
      </motion.div>

      {/* Connection Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <GlassCard className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4" />
                <path d="M2 17l10 5 10-5" stroke="#34A853" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" stroke="#FBBC05" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Google Ads</p>
              <p className="text-xs text-slate-500">
                {googleConnected ? "Conectado" : "Não conectado"}
              </p>
            </div>
          </div>
          <GlowButton
            size="sm"
            variant={googleConnected ? "ghost" : "primary"}
            onClick={() => setGoogleConnected(!googleConnected)}
          >
            {googleConnected ? (
              <>
                <Check className="h-4 w-4" /> Conectado
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" /> Conectar
              </>
            )}
          </GlowButton>
        </GlassCard>

        <GlassCard className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1877F2" />
                <path
                  d="M15.5 8H14c-.83 0-1.5.67-1.5 1.5V11h3l-.5 3h-2.5v7h-3v-7H8v-3h1.5V9.5A3.5 3.5 0 0113 6h2.5v2z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Meta Ads</p>
              <p className="text-xs text-slate-500">
                {metaConnected ? "Conectado" : "Não conectado"}
              </p>
            </div>
          </div>
          <GlowButton
            size="sm"
            variant={metaConnected ? "ghost" : "primary"}
            onClick={() => setMetaConnected(!metaConnected)}
          >
            {metaConnected ? (
              <>
                <Check className="h-4 w-4" /> Conectado
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" /> Conectar
              </>
            )}
          </GlowButton>
        </GlassCard>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={1}
      >
        {[
          { label: "Gasto Total", value: 0, prefix: "R$", icon: DollarSign, color: "text-violet-400" },
          { label: "Cliques", value: 0, icon: MousePointerClick, color: "text-blue-400" },
          { label: "Conversões", value: 0, icon: Target, color: "text-emerald-400" },
          { label: "CPA", value: 0, prefix: "R$", icon: Megaphone, color: "text-amber-400" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-slate-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              <AnimatedCounter value={stat.value} prefix={stat.prefix} />
            </p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Campaigns Table / Empty State */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={2}
      >
        <GlassCard className="p-6" hover={false}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Suas Campanhas</h2>
          {campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 mx-auto mb-6">
                <Megaphone className="h-8 w-8 text-slate-900/30" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900/80 mb-2">
                Nenhuma campanha encontrada
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Conecte sua conta do Google Ads ou Meta Ads para comecar a gerenciar seus anuncios em um so lugar.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Campanha</th>
                    <th className="pb-3 pr-4 font-medium">Plataforma</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Gasto</th>
                    <th className="pb-3 pr-4 font-medium">Cliques</th>
                    <th className="pb-3 font-medium">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, idx) => (
                    <motion.tr
                      key={c.name}
                      className="border-b border-slate-200 last:border-0"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.08 }}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900">{c.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.platform}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            c.status === "Ativa"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-gray-500/10 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              c.status === "Ativa" ? "bg-emerald-400" : "bg-gray-400"
                            }`}
                          />
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{c.spent}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.clicks.toLocaleString("pt-BR")}</td>
                      <td className="py-3 text-slate-600">{c.cpa}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Optimizer Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={3}
        >
          <GlassCard className="p-6" hover={false}>
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-slate-900">Sugestões do Otimizador</h2>
            </div>
            <div className="space-y-3">
              {suggestions.map((s, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <s.icon className={`h-5 w-5 shrink-0 ${s.color}`} />
                    <p className="text-sm text-slate-600">{s.text}</p>
                  </div>
                  <GlowButton size="sm" variant="secondary" className="ml-4 shrink-0">
                    Aplicar
                  </GlowButton>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
