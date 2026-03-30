"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GlowButton } from "@/components/shared/glow-button"
import { GradientText } from "@/components/shared/gradient-text"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou senha incorretos")
      setLoading(false)
    } else {
      // Redirect to setup if new user, or painel if already setup
      window.location.href = "/painel"  // painel will check and redirect to /setup if needed
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <Link href="/">
          <GradientText as="h1" className="text-3xl font-bold">AdsUnify</GradientText>
        </Link>
      </div>

      <GlassCard hover={false} className="p-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Bem-vindo de volta</h2>
        <p className="text-slate-500 text-center mb-6">Entre na sua conta para continuar</p>

        {/* Google login - only shows when configured */}
        {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
          <>
            <button
              onClick={() => signIn("google", { callbackUrl: "/painel" })}
              className="w-full flex items-center justify-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 hover:bg-slate-100 transition-colors mb-6"
            >
              <Globe className="w-5 h-5" />
              Continuar com Google
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-500 mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="#" className="text-sm text-violet-600 hover:text-violet-500">
              Esqueceu a senha?
            </Link>
          </div>

          <GlowButton variant="primary" className="w-full py-3" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </GlowButton>
        </form>
      </GlassCard>

      <p className="text-center text-slate-500 mt-6">
        Não tem conta?{" "}
        <Link href="/registro" className="text-violet-600 hover:text-violet-500 font-medium">
          Criar conta grátis
        </Link>
      </p>
    </motion.div>
  )
}
