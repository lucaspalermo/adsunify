"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  User,
  Building2,
  Plug,
  CreditCard,
  Camera,
  Bell,
  Mail,
  Lock,
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

const tabs = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "negocio", label: "Negócio", icon: Building2 },
  { id: "integracoes", label: "Integrações", icon: Plug },
  { id: "plano", label: "Plano", icon: CreditCard },
]

const notifications = [
  { id: "missoes", label: "Missões semanais", defaultOn: true },
  { id: "concorrentes", label: "Alertas de concorrentes", defaultOn: true },
  { id: "relatorios", label: "Relatórios mensais", defaultOn: true },
  { id: "novidades", label: "Novidades do AdsUnify", defaultOn: false },
]

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-violet-600" : "bg-slate-100"
      }`}
    >
      <motion.div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    missoes: true,
    concorrentes: true,
    relatorios: true,
    novidades: false,
  })

  const handleToggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          <GradientText as="span">Configurações</GradientText>
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        custom={0}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-violet-500/10 text-violet-600"
                : "text-slate-500 hover:text-slate-600"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content - Perfil */}
      {activeTab === "perfil" && (
        <div className="space-y-6">
          {/* Profile Form */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={1}
          >
            <GlassCard className="p-6" hover={false}>
              <h2 className="mb-6 font-semibold text-slate-900">Informações Pessoais</h2>
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold text-white">
                      ?
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f9fc] bg-violet-600 text-white transition-colors hover:bg-violet-500">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Foto de perfil</p>
                    <p className="text-xs text-slate-500">JPG, PNG ou GIF. Máx 2MB.</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Nome
                  </label>
                  <input
                    type="text"
                    defaultValue=""
                    placeholder="Seu nome completo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      defaultValue=""
                      placeholder="seu@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    Senha
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        defaultValue="••••••••••"
                        disabled
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-400 outline-none"
                      />
                    </div>
                    <button className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-300">
                      Alterar senha
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <GlowButton>Salvar alterações</GlowButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Notifications */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="mb-5 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                <h2 className="font-semibold text-slate-900">Notificações</h2>
              </div>
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-600">{notif.label}</span>
                    <Toggle
                      checked={toggles[notif.id]}
                      onChange={() => handleToggle(notif.id)}
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Current Plan */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <GlassCard className="p-6" hover={false} glow glowColor="rgba(139, 92, 246, 0.1)">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-violet-600" />
                <h2 className="font-semibold text-slate-900">Plano Atual</h2>
              </div>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">Agencia</span>
                <span className="text-lg text-slate-500">— R$397/mês</span>
              </div>
              <p className="mb-5 text-sm text-slate-500">
                Gerencie seu plano e pagamento na pagina de planos.
              </p>
              <div className="flex items-center gap-4">
                <GlowButton size="sm">Mudar plano</GlowButton>
                <button className="text-sm text-red-400 transition-colors hover:text-red-300">
                  Cancelar assinatura
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab === "negocio" && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={1}
        >
          <GlassCard className="flex items-center justify-center p-12" hover={false}>
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-500">
                Configurações do negócio em breve
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === "integracoes" && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={1}
        >
          <GlassCard className="flex items-center justify-center p-12" hover={false}>
            <div className="text-center">
              <Plug className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-500">
                Integrações disponíveis em breve
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === "plano" && (
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={1}
        >
          <GlassCard className="flex items-center justify-center p-12" hover={false}>
            <div className="text-center">
              <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-500">
                Gerenciamento de planos em breve
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
