"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, User, Building2, Plug, CreditCard, Save, Loader2, Check, Globe, Key } from "lucide-react"
import { useSession } from "next-auth/react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { useUserId } from "@/hooks/use-user-id"
import { cn } from "@/lib/utils"
import Link from "next/link"

const tabs = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "negocio", label: "Meu Negocio", icon: Building2 },
  { id: "integracoes", label: "Integracoes", icon: Plug },
  { id: "plano", label: "Plano & Pagamento", icon: CreditCard },
]

export default function ConfiguracoesPage() {
  const userId = useUserId()
  const { data: session } = useSession()
  const [tab, setTab] = useState("perfil")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [sites, setSites] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    fetch(`/api/user?userId=${userId}`).then(r => r.json()).then(setUserData).catch(() => {})
    fetch(`/api/sites?userId=${userId}`).then(r => r.json()).then(d => setSites(Array.isArray(d) ? d : [])).catch(() => {})
  }, [userId])

  const [name, setName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessUrl, setBusinessUrl] = useState("")
  const [businessNiche, setBusinessNiche] = useState("")

  useEffect(() => {
    if (userData) {
      setName(userData.name || "")
      setBusinessName(userData.businessName || "")
      setBusinessUrl(userData.businessUrl || "")
      setBusinessNiche(userData.businessNiche || "")
    }
  }, [userData])

  async function saveProfile() {
    if (!userId) return
    setSaving(true)
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, businessName, businessUrl, businessNiche }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">Configuracoes</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Gerencie sua conta, negocio e integracoes</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-zinc-800 p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex-1 justify-center",
            tab === t.id ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm" : "text-slate-500 dark:text-zinc-400"
          )}>
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Perfil Tab */}
      {tab === "perfil" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-4">Informacoes Pessoais</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Email</label>
                <input type="email" value={session?.user?.email || ""} disabled
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 px-4 text-sm text-slate-500 dark:text-zinc-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Plano Atual</label>
                <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-500">
                  {userData?.plan || "STARTER"}
                </span>
              </div>
              <GlowButton onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Salvo!" : "Salvar"}
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Negocio Tab */}
      {tab === "negocio" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-4">Dados do Negocio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Nome do negocio</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Site principal</label>
                <input type="text" value={businessUrl} onChange={e => setBusinessUrl(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Nicho</label>
                <input type="text" value={businessNiche} onChange={e => setBusinessNiche(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:border-indigo-500/50" />
              </div>
              <GlowButton onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </GlowButton>
            </div>
          </GlassCard>

          {/* Multi-site */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-500" /> Seus Sites ({sites.length})
            </h3>
            {sites.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-zinc-400 py-2">Nenhum site cadastrado. Adicione pelo seletor no topo da pagina.</p>
            ) : (
              <div className="space-y-2">
                {sites.map(site => (
                  <div key={site.id} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{site.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{site.url}</p>
                    </div>
                    {site.isPrimary && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500">Principal</span>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Integracoes Tab */}
      {tab === "integracoes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {[
            { name: "Google Ads", desc: "Conecte sua conta pra gerenciar campanhas", href: "/api/oauth/google-ads/connect", connected: false },
            { name: "Meta Ads", desc: "Facebook e Instagram Ads", href: "/api/oauth/meta-ads/connect", connected: false },
            { name: "Google Search Console", desc: "Veja como seu site aparece no Google", href: "/api/oauth/gsc/connect", connected: false },
            { name: "WhatsApp (Evolution API)", desc: "Automacao de mensagens", href: "/whatsapp", connected: false },
          ].map(integration => (
            <GlassCard key={integration.name} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{integration.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{integration.desc}</p>
                </div>
                <Link href={`${integration.href}?userId=${userId}`}>
                  <GlowButton size="sm" variant={integration.connected ? "secondary" : "primary"}>
                    <Plug className="h-3.5 w-3.5" /> {integration.connected ? "Conectado" : "Conectar"}
                  </GlowButton>
                </Link>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}

      {/* Plano Tab */}
      {tab === "plano" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-2">Seu Plano</h3>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-indigo-500">{userData?.plan || "STARTER"}</span>
            </div>
            <div className="mt-4">
              <Link href="/configuracoes/plano">
                <GlowButton><CreditCard className="h-4 w-4" /> Ver planos e fazer upgrade</GlowButton>
              </Link>
            </div>
          </GlassCard>

          {/* API Key for public API */}
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-500" /> API Publica
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Use esta chave pra acessar a API publica do AdsUnify</p>
            <div className="rounded-xl bg-slate-50 dark:bg-zinc-800 p-3 font-mono text-xs text-slate-600 dark:text-zinc-300 break-all">
              {userId ? btoa(`${session?.user?.email}:${userId}`) : "Carregando..."}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
