"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calculator,
  MousePointerClick,
  Users,
  DollarSign,
  TrendingUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

const nichos = ["E-commerce", "Serviços Locais", "SaaS", "Educação", "Saúde", "Imobiliário", "Alimentação"]
const plataformas = ["Google Ads", "Meta Ads", "Ambos"]

const monthLabels = ["Mês 1", "Mês 2", "Mês 3", "Mês 4", "Mês 5", "Mês 6"]
const monthValues = [800, 1200, 1600, 2100, 2800, 3600]

export default function PrevisaoPage() {
  const [investimento, setInvestimento] = useState(0)
  const [nicho, setNicho] = useState("E-commerce")
  const [plataforma, setPlataforma] = useState("Google Ads")
  const [calculated, setCalculated] = useState(false)

  const maxVal = Math.max(...monthValues)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Previsão de Resultados</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Simule investimentos e veja resultados estimados
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <GlassCard className="p-6" hover={false}>
          <div className="space-y-6">
            {/* Slider */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-600">
                  Investimento mensal em anúncios
                </label>
                <span className="text-lg font-bold text-slate-900">
                  R${investimento.toLocaleString("pt-BR")}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={investimento}
                onChange={(e) => setInvestimento(Number(e.target.value))}
                className="w-full cursor-pointer accent-violet-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>R$0</span>
                <span>R$10.000</span>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  Seu nicho
                </label>
                <div className="relative">
                  <select
                    value={nicho}
                    onChange={(e) => setNicho(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-violet-500/50"
                  >
                    {nichos.map((n) => (
                      <option key={n} value={n} className="bg-gray-900">
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-600">
                  Plataforma principal
                </label>
                <div className="relative">
                  <select
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-violet-500/50"
                  >
                    {plataformas.map((p) => (
                      <option key={p} value={p} className="bg-gray-900">
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            <GlowButton onClick={() => setCalculated(true)}>
              <Calculator className="h-4 w-4" />
              Calcular Previsão
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Results */}
      {calculated && (
        <>
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={1}
          >
            {[
              {
                label: "Cliques estimados/mês",
                range: "1.200 — 1.800",
                icon: MousePointerClick,
                color: "text-blue-400",
              },
              {
                label: "Leads estimados/mês",
                range: "60 — 120",
                icon: Users,
                color: "text-emerald-400",
              },
              {
                label: "Custo por lead",
                range: "R$12,50 — R$25,00",
                icon: DollarSign,
                color: "text-amber-400",
              },
            ].map((r) => (
              <GlassCard key={r.label} className="p-6 text-center" glow>
                <r.icon className={`mx-auto h-8 w-8 ${r.color}`} />
                <p className="mt-3 text-xs text-slate-500">{r.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{r.range}</p>
              </GlassCard>
            ))}
          </motion.div>

          {/* Chart */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Projeção de Crescimento — 6 meses
                </h2>
              </div>

              <div className="flex items-end justify-between gap-3" style={{ height: 220 }}>
                {monthValues.map((val, idx) => {
                  const heightPct = (val / maxVal) * 100
                  return (
                    <div
                      key={idx}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-xs font-medium text-slate-600">
                        {val.toLocaleString("pt-BR")}
                      </span>
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{
                          background: "linear-gradient(to top, #8b5cf6, #3b82f6)",
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{
                          duration: 0.6,
                          delay: 0.5 + idx * 0.1,
                          ease: "easeOut",
                        }}
                      />
                      <span className="text-xs text-slate-400">{monthLabels[idx]}</span>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-200/80">
                Estimativas baseadas em dados médios do setor. Resultados reais podem variar.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
