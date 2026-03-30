"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { Globe, Mail, ExternalLink, Link2 } from "lucide-react"

function MarketingHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GradientText as="span" className="text-xl font-bold">
            AdsUnify
          </GradientText>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex">
          <Link href="/#funcionalidades" className="transition hover:text-slate-900">
            Funcionalidades
          </Link>
          <Link href="/precos" className="transition hover:text-slate-900">
            Precos
          </Link>
          <Link href="/login" className="transition hover:text-slate-900">
            Login
          </Link>
        </nav>

        <Link href="/registro">
          <GlowButton variant="primary" size="sm">
            Comecar Gratis
          </GlowButton>
        </Link>
      </div>
    </motion.header>
  )
}

function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <GradientText as="span" className="text-xl font-bold">
            AdsUnify
          </GradientText>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <Link href="/#funcionalidades" className="transition hover:text-slate-900">
            Funcionalidades
          </Link>
          <Link href="/precos" className="transition hover:text-slate-900">
            Precos
          </Link>
          <span className="cursor-default text-slate-400" title="Em breve">
            Blog
          </span>
          <span className="cursor-default text-slate-400" title="Em breve">
            Suporte
          </span>
        </nav>

        <div className="flex items-center gap-4 text-slate-400">
          <a href="#" className="transition hover:text-slate-900"><Globe className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><Mail className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><ExternalLink className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><Link2 className="h-5 w-5" /></a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; 2026 AdsUnify. Todos os direitos reservados.
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black text-slate-900">
      {/* Subtle gradient glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.12),transparent)]" />

      <MarketingHeader />
      <main className="relative z-10 pt-16">{children}</main>
      <MarketingFooter />
    </div>
  )
}
