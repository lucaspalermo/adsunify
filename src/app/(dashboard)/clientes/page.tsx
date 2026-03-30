"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Plus, Loader2, Mail, Globe, Trash2, Crown } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"

interface Client {
  id: string
  clientId: string
  name: string
  email: string
  url: string | null
  niche: string | null
  addedAt: string
}

export default function ClientesPage() {
  const userId = useUserId()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [error, setError] = useState("")
  const [limits, setLimits] = useState({ maxClients: 20, currentClients: 0, remaining: 20 })

  useEffect(() => {
    if (!userId) return
    fetch(`/api/white-label?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setClients(data.clients || [])
        setLimits(data.limits || limits)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  async function addClient() {
    if (!newEmail.trim() || !userId) return
    setError("")
    setAdding(true)
    try {
      const res = await fetch("/api/white-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyUserId: userId, clientEmail: newEmail.trim(), clientName: newName.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setNewEmail("")
        setNewName("")
        // Refresh
        const refreshRes = await fetch(`/api/white-label?userId=${userId}`).then(r => r.json())
        setClients(refreshRes.clients || [])
        setLimits(refreshRes.limits || limits)
      }
    } catch {}
    setAdding(false)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Gestao de Clientes</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          White-label — gerencie ate {limits.maxClients} clientes com sua marca
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <Users className="mx-auto h-6 w-6 text-indigo-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{limits.currentClients}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Clientes ativos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Crown className="mx-auto h-6 w-6 text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{limits.maxClients}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Limite do plano</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Plus className="mx-auto h-6 w-6 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{limits.remaining}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Vagas disponiveis</p>
        </GlassCard>
      </div>

      {/* Add Client */}
      <GlassCard className="p-5" hover={false}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">Adicionar Cliente</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="email" placeholder="Email do cliente" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
          <input type="text" placeholder="Nome (opcional)" value={newName} onChange={e => setNewName(e.target.value)}
            className="h-11 sm:w-48 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
          <GlowButton onClick={addClient} disabled={adding || !newEmail.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </GlowButton>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </GlassCard>

      {/* Client List */}
      {clients.length === 0 ? (
        <GlassCard className="p-8 text-center" hover={false}>
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">Nenhum cliente ainda</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Adicione seu primeiro cliente acima</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {clients.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-500">
                      {client.name?.[0]?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{client.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                        <Mail className="h-3 w-3" /> {client.email}
                        {client.url && <><Globe className="h-3 w-3 ml-1" /> {client.url}</>}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(client.addedAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
