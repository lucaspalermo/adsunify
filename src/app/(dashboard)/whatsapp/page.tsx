"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageCircle, QrCode, Loader2, Send, Users, Wifi, WifiOff, Plus, Trash2 } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

export default function WhatsAppPage() {
  const [instanceName, setInstanceName] = useState("")
  const [instances, setInstances] = useState<any[]>([])
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [activeInstance, setActiveInstance] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/whatsapp?action=list")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInstances(data) })
      .catch(() => {})
  }, [])

  async function createInstance() {
    if (!instanceName.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", instanceName: instanceName.trim() }),
      })
      const data = await res.json()
      if (data.qrcode) setQrCode(data.qrcode.base64)
      setActiveInstance(instanceName.trim())
      setInstanceName("")
    } catch {}
    setLoading(false)
  }

  async function sendMessage() {
    if (!activeInstance || !phone.trim() || !message.trim()) return
    setLoading(true)
    setSendResult(null)
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", instanceName: activeInstance, phone: phone.trim(), message: message.trim() }),
      })
      const data = await res.json()
      setSendResult(data.key ? "Mensagem enviada!" : "Erro ao enviar")
      if (data.key) { setPhone(""); setMessage("") }
    } catch {
      setSendResult("Erro ao enviar")
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 sm:text-3xl">
          <GradientText as="span">WhatsApp Automation</GradientText>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          Conecte seu WhatsApp e envie mensagens automatizadas via Evolution API
        </p>
      </motion.div>

      {/* Create Instance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-indigo-500" /> Conectar WhatsApp
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da instancia (ex: meu-whatsapp)"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="h-11 flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50"
            />
            <GlowButton onClick={createInstance} disabled={loading || !instanceName.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar & Conectar
            </GlowButton>
          </div>

          {qrCode && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex flex-col items-center">
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-3">Escaneie o QR Code com seu WhatsApp:</p>
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white p-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>

      {/* Send Message */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <Send className="h-4 w-4 text-indigo-500" /> Enviar Mensagem
          </h3>

          {!activeInstance ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400 py-4 text-center">Conecte uma instancia primeiro para enviar mensagens</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-green-500 mb-2">
                <Wifi className="h-3 w-3" /> Instancia: {activeInstance}
              </div>
              <input
                type="text"
                placeholder="Numero com DDD (ex: 5511999999999)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50"
              />
              <textarea
                placeholder="Sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-indigo-500/50 resize-none"
              />
              <div className="flex items-center justify-between">
                <GlowButton onClick={sendMessage} disabled={loading || !phone.trim() || !message.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar
                </GlowButton>
                {sendResult && (
                  <span className={cn("text-sm font-medium", sendResult.includes("enviada") ? "text-green-500" : "text-red-500")}>
                    {sendResult}
                  </span>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
