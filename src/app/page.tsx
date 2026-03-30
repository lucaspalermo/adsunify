"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Brain,
  Target,
  Search,
  Eye,
  FileText,
  TrendingUp,
  Check,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Mail,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
  ChevronRight,
  Play,
  CreditCard,
  QrCode,
  Receipt,
  Star,
  MousePointer,
  Loader2,
} from "lucide-react"
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll"
import { MagneticButton } from "@/components/landing/magnetic-button"
import { GlowCard } from "@/components/landing/glow-card"
import { cn } from "@/lib/utils"

// Dynamic import for Three.js globe (no SSR)
const GlobeScene = dynamic(
  () => import("@/components/landing/globe-scene").then((m) => m.GlobeScene),
  { ssr: false }
)

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════════ */
function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn("relative py-32 lg:py-40", className)}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════════════════ */
function SectionHeading({
  badge,
  title,
  titleGradient,
  subtitle,
}: {
  badge?: string
  title: string
  titleGradient?: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {badge && (
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {badge}
        </motion.div>
      )}
      <motion.h2
        variants={fadeUp}
        className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}{" "}
        {titleGradient && (
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            {titleGradient}
          </span>
        )}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="max-w-2xl text-lg leading-relaxed text-zinc-400">
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            AdsUnify
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#funcionalidades" className="transition-colors hover:text-white">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-white">
            Como Funciona
          </a>
          <a href="#precos" className="transition-colors hover:text-white">
            Precos
          </a>
        </nav>

        {/* CTA buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Entrar
          </Link>
          <Link href="/registro">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-shadow hover:shadow-indigo-500/40"
            >
              Comecar Gratis
            </motion.button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block h-0.5 w-6 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-0.5 w-6 bg-white"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.06] bg-[#09090B]/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-4 p-6 text-sm">
              <a href="#funcionalidades" onClick={() => setMobileOpen(false)} className="text-zinc-300 hover:text-white">Funcionalidades</a>
              <a href="#como-funciona" onClick={() => setMobileOpen(false)} className="text-zinc-300 hover:text-white">Como Funciona</a>
              <a href="#precos" onClick={() => setMobileOpen(false)} className="text-zinc-300 hover:text-white">Precos</a>
              <hr className="border-white/[0.06]" />
              <Link href="/login" className="text-zinc-300 hover:text-white">Entrar</Link>
              <Link href="/registro" className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center font-semibold text-white">
                Comecar Gratis
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   1 — HERO
   ═══════════════════════════════════════════════════════════════════ */
function Hero() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 60])
  const globeScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2])
  const globeOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3])

  return (
    <section className="relative flex min-h-[110vh] flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

      {/* 3D Globe — full prominence */}
      <motion.div
        style={{ scale: globeScale, opacity: globeOpacity }}
        className="pointer-events-none absolute inset-0"
      >
        {/* Radial glow behind globe */}
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/[0.08] blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-[80px]" />
        <GlobeScene />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative z-10 flex max-w-5xl flex-col items-center gap-8 px-5 text-center"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center gap-8"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.08] px-5 py-2 text-sm text-indigo-300 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            Plataforma #1 de Marketing com IA
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-8xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Domine o Marketing
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Sem Agencia.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
          >
            O co-piloto de marketing com inteligencia artificial que transforma
            iniciantes em especialistas.{" "}
            <span className="text-zinc-300">Aprenda fazendo, nao assistindo.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/registro">
              <MagneticButton variant="primary" size="lg">
                Comecar Gratis <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </Link>
            <Link href="#demo">
              <MagneticButton variant="secondary" size="lg">
                <Play className="h-4 w-4" /> Ver Demo
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500"
          >
            {["7 dias gratis", "Sem cartao de credito", "Cancele quando quiser"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center justify-center gap-12 sm:gap-16"
          >
            {[
              { value: "2.500+", label: "usuarios ativos" },
              { value: "50K+", label: "conteudos gerados" },
              { value: "4.9", label: "avaliacao media", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-3xl font-bold text-white">
                  {stat.value}
                  {stat.icon && <stat.icon className="h-5 w-5 fill-amber-400 text-amber-400" />}
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/10 pt-2"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   2 — PROBLEM / PAIN POINTS
   ═══════════════════════════════════════════════════════════════════ */
function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const pains = [
    {
      icon: CreditCard,
      color: "from-red-500/20 to-red-500/5",
      iconColor: "text-red-400",
      title: "Dinheiro jogado fora em anuncios",
      desc: "Boosted posts, Google Ads, impulsionamentos... e o retorno? Zero. Seu orcamento desaparece sem explicacao.",
    },
    {
      icon: Brain,
      color: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
      title: "Perdido em termos tecnicos",
      desc: "CPC, CTR, SERP, ROI... O marketing digital parece outro idioma. Voce quer resultados, nao um dicionario.",
    },
    {
      icon: Eye,
      color: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-400",
      title: "Refem de agencias caras",
      desc: "Relatorios confusos, metricas sem contexto e a sensacao de estar refem de quem deveria te ajudar.",
    },
  ]

  return (
    <Section>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16"
      >
        <SectionHeading
          badge="O Problema"
          title="Voce ja se sentiu"
          titleGradient="assim?"
          subtitle="Milhares de empreendedores enfrentam os mesmos desafios todos os dias."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {pains.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <GlowCard glowColor={p.color.includes("red") ? "rgba(239,68,68,0.1)" : p.color.includes("amber") ? "rgba(245,158,11,0.1)" : "rgba(139,92,246,0.1)"}>
                <div className="flex flex-col gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", p.color)}>
                    <p.icon className={cn("h-6 w-6", p.iconColor)} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{p.desc}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] px-8 py-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <p className="text-lg font-medium text-zinc-300">
              O AdsUnify resolve{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text font-bold text-transparent">
                tudo isso.
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   3 — FEATURES
   ═══════════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      Icon: Brain,
      title: "Co-Piloto IA",
      desc: "Uma IA que conhece seu negocio e sugere acoes personalizadas todos os dias.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      Icon: Target,
      title: "Missoes Gamificadas",
      desc: "Aprenda marketing fazendo missoes. Ganhe XP, suba de nivel e desbloqueie badges.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      Icon: Search,
      title: "SEO Inteligente",
      desc: "Descubra palavras-chave certas e monitore seu ranking no Google automaticamente.",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      Icon: Eye,
      title: "Espiao de Concorrentes",
      desc: "Saiba exatamente o que seus concorrentes estao fazendo — e faca melhor.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      Icon: FileText,
      title: "Fabrica de Conteudo",
      desc: "Artigos, posts, anuncios — tudo gerado por IA e otimizado para seu negocio.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      Icon: TrendingUp,
      title: "Previsao de Resultados",
      desc: "Simule investimentos e veja resultados estimados antes de gastar R$1.",
      gradient: "from-emerald-500 to-green-500",
    },
  ]

  return (
    <Section id="funcionalidades">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16"
      >
        <SectionHeading
          badge="Funcionalidades"
          title="Tudo que voce precisa."
          titleGradient="Em um so lugar."
          subtitle="Seis modulos poderosos que trabalham juntos para transformar seu marketing digital."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, desc, gradient }) => (
            <motion.div key={title} variants={fadeUp}>
              <GlowCard className="h-full">
                <div className="flex flex-col gap-5">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", gradient, "opacity-90")}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{desc}</p>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                    Saiba mais <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   4 — HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      num: "01",
      title: "Conte sobre seu negocio",
      desc: "Responda algumas perguntas simples e nossa IA vai entender completamente seu mercado, publico e objetivos.",
      icon: MousePointer,
    },
    {
      num: "02",
      title: "Receba seu plano sob medida",
      desc: "Missoes semanais, sugestoes de conteudo, estrategias de SEO e anuncios — tudo personalizado para voce.",
      icon: Sparkles,
    },
    {
      num: "03",
      title: "Veja resultados reais",
      desc: "Acompanhe sua evolucao no dashboard, celebre conquistas e veja seu negocio crescer semana a semana.",
      icon: BarChart3,
    },
  ]

  return (
    <Section id="como-funciona" className="overflow-hidden">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-20"
      >
        <SectionHeading
          badge="Como Funciona"
          title="Simples como"
          titleGradient="1, 2, 3."
          subtitle="Em minutos voce tera um plano completo de marketing digital sob medida."
        />

        <div className="relative w-full">
          {/* Connecting line */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 lg:block">
            <div className="h-full w-full bg-gradient-to-b from-indigo-500/50 via-violet-500/50 to-purple-500/50" />
          </div>

          <div className="flex flex-col gap-24 lg:gap-32">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                className={cn(
                  "flex flex-col items-center gap-8 lg:flex-row lg:gap-16",
                  i % 2 === 1 && "lg:flex-row-reverse"
                )}
              >
                {/* Number + Icon */}
                <div className="flex flex-1 justify-center">
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                      <s.icon className="h-12 w-12 text-indigo-400" />
                    </div>
                    <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                      {s.num}
                    </div>
                    {/* Glow */}
                    <div className="absolute inset-0 -z-10 rounded-3xl bg-indigo-500/20 blur-2xl" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-1 flex-col gap-4 text-center lg:text-left">
                  <h3
                    className="text-2xl font-bold text-white sm:text-3xl"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="max-w-md text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   5 — INTERACTIVE DEMO
   ═══════════════════════════════════════════════════════════════════ */
function DemoSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    score: number
    seo: number
    speed: number
    mobile: number
  }>(null)

  const handleAnalyze = useCallback(() => {
    if (!url.trim()) return
    setAnalyzing(true)
    setResult(null)

    // Simulated analysis
    setTimeout(() => {
      setResult({
        score: Math.floor(Math.random() * 40 + 30),
        seo: Math.floor(Math.random() * 50 + 20),
        speed: Math.floor(Math.random() * 60 + 15),
        mobile: Math.floor(Math.random() * 45 + 25),
      })
      setAnalyzing(false)
    }, 2500)
  }, [url])

  function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
    const circumference = 2 * Math.PI * 36
    const offset = circumference - (value / 100) * circumference
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90">
            <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="48"
              cy="48"
              r="36"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{value}</span>
          </div>
        </div>
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
    )
  }

  return (
    <Section id="demo">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-12"
      >
        <SectionHeading
          badge="Demo Interativa"
          title="Teste agora."
          titleGradient="Gratis."
          subtitle="Cole a URL do seu site e veja um preview instantaneo do diagnostico que o AdsUnify gera."
        />

        <motion.div
          variants={scaleIn}
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>
            <div className="ml-4 flex flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <Globe className="h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Digite a URL do seu site..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim()}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Analisar"
              )}
            </button>
          </div>

          {/* Result area */}
          <div className="min-h-[250px] p-8">
            <AnimatePresence mode="wait">
              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 py-12"
                >
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
                    <div className="absolute inset-2 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                  </div>
                  <p className="text-sm text-zinc-500">Analisando {url}...</p>
                </motion.div>
              )}

              {!analyzing && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="flex flex-wrap items-center justify-center gap-8">
                    <ScoreRing value={result.score} label="Score Geral" color="#6366f1" />
                    <ScoreRing value={result.seo} label="SEO" color="#8b5cf6" />
                    <ScoreRing value={result.speed} label="Velocidade" color="#06b6d4" />
                    <ScoreRing value={result.mobile} label="Mobile" color="#10b981" />
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-center text-sm text-zinc-400">
                      Seu site tem <span className="font-semibold text-amber-400">oportunidades significativas</span> de melhoria.
                      O AdsUnify cria um plano completo para voce.
                    </p>
                    <Link href="/registro">
                      <MagneticButton variant="primary" size="md">
                        Ver Diagnostico Completo <ArrowRight className="h-4 w-4" />
                      </MagneticButton>
                    </Link>
                  </div>
                </motion.div>
              )}

              {!analyzing && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-12 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                    <Search className="h-8 w-8 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">
                    Cole a URL do seu site acima para ver o diagnostico
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   6 — PRICING (3D Parallax Cards)
   ═══════════════════════════════════════════════════════════════════ */
function PricingCard({
  plan,
  isAnnual,
  popular,
}: {
  plan: {
    name: string
    monthlyPrice: number
    yearlyPrice: number
    tagline: string
    inheritLabel: string | null
    features: string[]
  }
  isAnnual: boolean
  popular: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 })
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 })

  function handleMouse(e: React.MouseEvent) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    rotateX.set((e.clientY - centerY) * -0.05)
    rotateY.set((e.clientX - centerX) * 0.05)
  }

  function handleLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  const price = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
      }}
      className={cn("relative", popular && "lg:-mt-4 lg:mb-4")}
    >
      <div
        className={cn(
          "relative flex h-full flex-col gap-6 rounded-2xl border p-8 backdrop-blur-sm transition-colors",
          popular
            ? "border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.08] to-transparent shadow-2xl shadow-indigo-500/10"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12]"
        )}
      >
        {popular && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
            Mais Popular
          </span>
        )}

        <div className="flex flex-col gap-2">
          <h3
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {plan.name}
          </h3>
          <p className="text-sm text-zinc-500">{plan.tagline}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-white">R${price}</span>
            <span className="text-zinc-500">/mes</span>
          </div>
          {isAnnual && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 line-through">R${plan.monthlyPrice}/mes</p>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                -17%
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div className="flex-1">
          {plan.inheritLabel && (
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              {plan.inheritLabel}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/registro" className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full rounded-xl py-3 text-sm font-semibold transition-all",
              popular
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                : "border border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.06]"
            )}
          >
            Comecar Gratis
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

function PricingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 67,
      yearlyPrice: 670,
      tagline: "Para quem esta comecando",
      inheritLabel: null,
      features: [
        "1 site monitorado",
        "10 conteudos IA por mes",
        "2 concorrentes",
        "Missoes semanais",
        "Co-Piloto IA",
        "Glossario completo",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: 197,
      yearlyPrice: 1970,
      tagline: "Para quem quer resultados serios",
      inheritLabel: "Tudo do Starter +",
      features: [
        "3 sites monitorados",
        "Conteudo IA ilimitado",
        "10 concorrentes",
        "Funil Builder (10 paginas)",
        "Relatorios PDF ilimitados",
        "Otimizador de anuncios",
      ],
    },
    {
      name: "Agencia",
      monthlyPrice: 397,
      yearlyPrice: 3970,
      tagline: "Para profissionais e agencias",
      inheritLabel: "Tudo do Pro +",
      features: [
        "10 sites monitorados",
        "Tudo ilimitado",
        "Multi-clientes",
        "White-label",
        "CRM basico",
        "Propostas automaticas",
        "Suporte prioritario",
      ],
    },
  ]

  return (
    <Section id="precos">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-12"
      >
        <SectionHeading
          badge="Pricing"
          title="Invista no seu"
          titleGradient="crescimento."
          subtitle="Todos os planos incluem 7 dias gratis. Sem compromisso."
        />

        {/* Billing toggle */}
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-white" : "text-zinc-500")}>
            Mensal
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative h-7 w-14 rounded-full transition-colors",
              isAnnual ? "bg-indigo-600" : "bg-zinc-700"
            )}
          >
            <motion.div
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-lg"
              animate={{ left: isAnnual ? 30 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={cn("flex items-center gap-2 text-sm font-medium transition-colors", isAnnual ? "text-white" : "text-zinc-500")}>
            Anual
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              2 meses gratis
            </span>
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3" style={{ perspective: 1000 }}>
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isAnnual={isAnnual}
              popular={plan.name === "Pro"}
            />
          ))}
        </div>

        {/* Payment methods */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Cartao (Stripe)</span>
          <span className="flex items-center gap-1.5"><QrCode className="h-4 w-4" /> PIX (Asaas)</span>
          <span className="flex items-center gap-1.5"><Receipt className="h-4 w-4" /> Boleto (Asaas)</span>
        </motion.div>

        {/* Guarantee */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-8 py-4">
          <Shield className="h-6 w-6 shrink-0 text-emerald-400" />
          <p className="text-sm text-zinc-400">
            <span className="font-semibold text-emerald-400">30 dias de garantia</span> — se nao
            estiver satisfeito, devolvemos 100% do seu dinheiro.
          </p>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   7 — SOCIAL PROOF / TESTIMONIALS
   ═══════════════════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const testimonials = [
    {
      name: "Ana Souza",
      role: "Dona de e-commerce",
      text: "Em 3 semanas minhas vendas organicas aumentaram 47%. O AdsUnify me mostrou exatamente o que corrigir no SEO.",
      avatar: "AS",
    },
    {
      name: "Pedro Lima",
      role: "Consultor de marketing",
      text: "Substituiu 3 ferramentas que eu pagava separado. O co-piloto IA e absurdamente bom para gerar conteudo.",
      avatar: "PL",
    },
    {
      name: "Carla Mendes",
      role: "Fundadora de SaaS",
      text: "As missoes gamificadas tornaram o marketing divertido. Minha equipe inteira usa e ja subimos 5 niveis.",
      avatar: "CM",
    },
  ]

  return (
    <Section>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16"
      >
        <SectionHeading
          badge="Depoimentos"
          title="Quem usa,"
          titleGradient="recomenda."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUp}>
              <GlowCard>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   8 — FINAL CTA
   ═══════════════════════════════════════════════════════════════════ */
function CtaSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <Section>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
      >
        <motion.div
          variants={scaleIn}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08]"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
          <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="relative flex flex-col items-center gap-8 px-8 py-20 text-center sm:px-16 sm:py-28">
            <motion.h2
              variants={fadeUp}
              className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pronto para dominar o{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                marketing digital?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-xl text-lg text-zinc-400">
              Junte-se a milhares de empreendedores que ja transformaram seus resultados com o AdsUnify.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/registro">
                <MagneticButton variant="primary" size="lg">
                  Comecar Gratis Agora <ArrowUpRight className="h-5 w-5" />
                </MagneticButton>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-zinc-500">
              7 dias gratis. Sem compromisso. Cancele quando quiser.
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   9 — FOOTER
   ═══════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 sm:flex-row sm:justify-between sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            AdsUnify
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
          <a href="#funcionalidades" className="transition-colors hover:text-white">Funcionalidades</a>
          <a href="#precos" className="transition-colors hover:text-white">Precos</a>
          <span className="cursor-default text-zinc-700" title="Em breve">Blog</span>
          <span className="cursor-default text-zinc-700" title="Em breve">Suporte</span>
        </nav>

        {/* Social */}
        <div className="flex items-center gap-4 text-zinc-600">
          <a href="#" className="transition-colors hover:text-white"><Globe className="h-5 w-5" /></a>
          <a href="#" className="transition-colors hover:text-white"><Mail className="h-5 w-5" /></a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-700">
        &copy; 2026 AdsUnify. Todos os direitos reservados.
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <SmoothScrollProvider>
      <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-zinc-50">
        {/* Noise overlay */}
        <div className="noise-overlay" />

        <Navbar />
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <DemoSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
        <Footer />
      </main>
    </SmoothScrollProvider>
  )
}
