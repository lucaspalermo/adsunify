"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard,
  Check,
  Crown,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  ExternalLink,
  Zap,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

/* ─── animation helpers ─── */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
}

/* ─── hardcoded demo data ─── */
const currentPlan = {
  name: "Agencia",
  price: "R$397",
  billing: "mensal",
  nextBillingDate: "",
  status: "ativo",
}

const usageData = {
  contents: { used: 0, limit: -1, label: "Conteudos IA" }, // -1 = ilimitado
  competitors: { used: 0, limit: -1, label: "Concorrentes" },
  sites: { used: 0, limit: 10, label: "Sites monitorados" },
  funnels: { used: 0, limit: -1, label: "Paginas de funil" },
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 67,
    yearlyPrice: 670,
    current: false,
    features: [
      "1 site monitorado",
      "10 conteudos IA/mes",
      "2 concorrentes",
      "Missoes semanais",
      "Co-Piloto IA",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 197,
    yearlyPrice: 1970,
    current: false,
    features: [
      "3 sites monitorados",
      "Conteudo IA ilimitado",
      "10 concorrentes",
      "Funil Builder",
      "Relatorios PDF",
      "Otimizador de anuncios",
    ],
  },
  {
    id: "agencia",
    name: "Agencia",
    price: 397,
    yearlyPrice: 3970,
    current: true,
    features: [
      "10 sites monitorados",
      "Tudo ilimitado",
      "Multi-clientes",
      "White-label",
      "CRM basico",
      "Suporte prioritario",
    ],
  },
]

/* ─── Usage bar component ─── */
function UsageBar({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string
  used: number
  limit: number
  icon: typeof FileText
}) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 30 : Math.min((used / limit) * 100, 100)
  const isHigh = !isUnlimited && percentage >= 80

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </div>
        <span className="text-sm text-slate-500">
          {used}
          {isUnlimited ? (
            <span className="ml-1 text-emerald-400">/ ilimitado</span>
          ) : (
            <span>
              {" "}
              / {limit}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isUnlimited
              ? "bg-gradient-to-r from-violet-500 to-blue-500"
              : isHigh
                ? "bg-gradient-to-r from-amber-500 to-red-500"
                : "bg-gradient-to-r from-violet-500 to-blue-500"
          )}
        />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function PlanoPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Gerenciar Plano</GradientText>
        </h1>
        <p className="mt-2 text-slate-500">
          Gerencie sua assinatura e acompanhe seu uso
        </p>
      </motion.div>

      {/* ─── Current Plan ─── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <GlassCard
          hover={false}
          glow
          glowColor="rgba(139, 92, 246, 0.1)"
          className="p-6"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 ring-1 ring-white/10">
                <Crown className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    Plano {currentPlan.name}
                  </h2>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-400">
                    {currentPlan.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="text-2xl font-bold text-slate-900">
                    {currentPlan.price}
                  </span>
                  <span className="text-slate-400">/{currentPlan.billing}</span>
                </p>
                {currentPlan.nextBillingDate && (
                  <p className="mt-2 text-sm text-slate-400">
                    Proxima cobranca:{" "}
                    <span className="text-slate-600">
                      {currentPlan.nextBillingDate}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GlowButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Opens Stripe portal or shows Asaas info
                  window.open("/api/payments/stripe/portal", "_blank")
                }}
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Gerenciar Pagamento
                </span>
              </GlowButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Usage Stats ─── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={1}
      >
        <GlassCard hover={false} className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold text-slate-900">Uso do Plano</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <UsageBar
              label={usageData.contents.label}
              used={usageData.contents.used}
              limit={usageData.contents.limit}
              icon={FileText}
            />
            <UsageBar
              label={usageData.competitors.label}
              used={usageData.competitors.used}
              limit={usageData.competitors.limit}
              icon={Users}
            />
            <UsageBar
              label={usageData.sites.label}
              used={usageData.sites.used}
              limit={usageData.sites.limit}
              icon={Zap}
            />
            <UsageBar
              label={usageData.funnels.label}
              used={usageData.funnels.used}
              limit={usageData.funnels.limit}
              icon={FileText}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Change Plan ─── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={2}
      >
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-violet-600" />
          <h2 className="font-semibold text-slate-900">Mudar Plano</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <GlassCard
              key={plan.id}
              hover={!plan.current}
              glow={plan.current}
              glowColor={
                plan.current ? "rgba(139, 92, 246, 0.08)" : undefined
              }
              className={cn(
                "relative flex flex-col gap-4 p-5",
                plan.current && "border-violet-500/20"
              )}
            >
              {plan.current && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-0.5 text-[10px] font-semibold text-white">
                  Plano Atual
                </span>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    R${plan.price}
                  </span>
                  <span className="text-sm text-slate-400">/mes</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2 text-xs">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-1.5 text-slate-500"
                  >
                    <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                {plan.current ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-slate-50 py-2 text-sm text-slate-400"
                  >
                    Plano atual
                  </button>
                ) : (
                  <GlowButton
                    variant={
                      plan.price > (currentPlan.price === "R$197" ? 197 : 0)
                        ? "primary"
                        : "secondary"
                    }
                    size="sm"
                    className="w-full"
                  >
                    <span>
                      {plan.price >
                      parseInt(currentPlan.price.replace("R$", ""))
                        ? "Fazer Upgrade"
                        : "Fazer Downgrade"}
                    </span>
                  </GlowButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* ─── Cancel Subscription ─── */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={3}
      >
        <GlassCard hover={false} className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Cancelar Assinatura</h3>
              <p className="mt-1 text-sm text-slate-500">
                Voce perdera acesso a todas as funcionalidades do plano atual
              </p>
            </div>
            <button
              onClick={() => setShowCancelDialog(true)}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20"
            >
              Cancelar Assinatura
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Cancel Confirmation Dialog ─── */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard
                hover={false}
                className="mx-4 max-w-md border-red-500/20 p-8"
              >
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Cancelar assinatura?
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    Tem certeza que deseja cancelar? Voce perdera acesso a todas
                    as funcionalidades premium no final do periodo atual.
                  </p>
                  <div className="flex w-full gap-3 pt-2">
                    <button
                      onClick={() => setShowCancelDialog(false)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Manter Plano
                    </button>
                    <button
                      onClick={() => {
                        // Handle cancellation
                        setShowCancelDialog(false)
                      }}
                      className="flex-1 rounded-xl bg-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                    >
                      Sim, cancelar
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
