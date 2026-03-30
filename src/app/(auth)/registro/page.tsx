"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, Globe, Check } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GlowButton } from "@/components/shared/glow-button"
import { GradientText } from "@/components/shared/gradient-text"

export default function RegistroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"]
  const strengthLabels = ["", "Fraca", "Media", "Forte"]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }
    if (!accepted) {
      setError("Aceite os termos para continuar")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      await signIn("credentials", { email, password, redirect: false })
      router.push("/onboarding")
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <Link href="/">
          <GradientText as="h1" className="text-3xl font-bold">AdsUnify</GradientText>
        </Link>
      </div>

      <GlassCard hover={false} className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Crie sua conta gratis</h2>
        <p className="text-slate-500 text-center mb-6">7 dias gratis. Sem cartao de credito.</p>

        {/* Google signup - only shows when configured */}
        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
          <>
            <button
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 hover:bg-slate-100 transition-colors mb-6"
            >
              <Globe className="w-5 h-5" />
              Continuar com Google
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimo 8 caracteres" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-white/10"}`} />
                  ))}
                </div>
                <span className={`text-xs ${passwordStrength === 3 ? "text-green-400" : passwordStrength === 2 ? "text-yellow-400" : "text-red-400"}`}>
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita sua senha" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors" />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <div onClick={() => setAccepted(!accepted)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${accepted ? "bg-violet-600 border-violet-600" : "border-slate-300 bg-slate-50"}`}>
              {accepted && <Check className="w-3 h-3 text-slate-900" />}
            </div>
            <span className="text-sm text-slate-500">
              Aceito os <Link href="#" className="text-violet-600 hover:underline">termos de uso</Link> e a{" "}
              <Link href="#" className="text-violet-600 hover:underline">politica de privacidade</Link>
            </span>
          </label>

          <GlowButton variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </GlowButton>
        </form>
      </GlassCard>

      <p className="text-center text-slate-400 mt-6">
        Ja tem conta?{" "}
        <Link href="/login" className="text-violet-600 hover:text-violet-300 font-medium">Fazer login</Link>
      </p>
    </motion.div>
  )
}
