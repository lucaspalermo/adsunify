"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Brain,
  Target,
  Search,
  Eye,
  FileText,
  TrendingUp,
  Check,
  ArrowRight,
  Globe,
  Mail,
  ExternalLink,
  Link2,
  CreditCard,
  QrCode,
  Receipt,
  Shield,
} from "lucide-react"
import { GlassCard } from "@/components/shared/glass-card"
import { GradientText } from "@/components/shared/gradient-text"
import { GlowButton } from "@/components/shared/glow-button"
import { cn } from "@/lib/utils"

/* ─── animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

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
    <section id={id} className={cn("relative py-28", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  )
}

/* ─── floating particles ─── */
function Particles() {
  const dots = [
    { size: 4, x: "10%", y: "20%", duration: 7, delay: 0 },
    { size: 6, x: "80%", y: "15%", duration: 9, delay: 1 },
    { size: 3, x: "25%", y: "70%", duration: 8, delay: 0.5 },
    { size: 5, x: "65%", y: "60%", duration: 10, delay: 2 },
    { size: 4, x: "50%", y: "35%", duration: 8, delay: 1.5 },
    { size: 3, x: "90%", y: "75%", duration: 11, delay: 0.8 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-violet-400"
          style={{
            width: dot.size,
            height: dot.size,
            left: dot.x,
            top: dot.y,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0.1, 0.3, 0.15, 0.25, 0.1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   1 — HERO
   ════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center bg-gradient-to-b from-violet-50/50 via-white to-[#f8f9fc]">
      {/* gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.08),transparent)]" />
      <Particles />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 flex max-w-4xl flex-col items-center gap-8"
      >
        {/* badge */}
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm text-violet-600 backdrop-blur-sm"
        >
          <span>🚀</span> A revolução do marketing digital chegou
        </motion.div>

        {/* headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
        >
          Domine o Marketing Digital
          <br />
          <GradientText as="span" className="block">
            Sem Precisar de Agência
          </GradientText>
        </motion.h1>

        {/* subtitle */}
        <motion.p
          variants={fadeUp}
          className="max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl"
        >
          O primeiro co-piloto de marketing com inteligência artificial que
          transforma iniciantes em especialistas. Aprenda fazendo, não
          assistindo.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/registro">
            <GlowButton variant="primary" size="lg">
              Começar Grátis <ArrowRight className="ml-1 h-4 w-4" />
            </GlowButton>
          </Link>
          <Link href="#funcionalidades">
            <GlowButton variant="secondary" size="lg">
              <span>Ver como funciona</span>
            </GlowButton>
          </Link>
        </motion.div>

        {/* trust badges */}
        <motion.p variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-400" /> 7 dias grátis</span>
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-400" /> Sem cartão de crédito</span>
          <span className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-400" /> Cancele quando quiser</span>
        </motion.p>

        {/* stats */}
        <motion.div
          variants={fadeUp}
          className="mt-4 flex flex-wrap items-center justify-center gap-8 text-center sm:gap-16"
        >
          {[
            { value: "2.500+", label: "usuários" },
            { value: "50.000+", label: "conteúdos gerados" },
            { value: "4.8★", label: "avaliação" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   2 — PROBLEM
   ════════════════════════════════════════════════════════════════════ */
function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const pains = [
    {
      emoji: "💸",
      title: "Gastou dinheiro em anúncios sem resultado",
      desc: "Boosted posts, Google Ads, impulsionamentos... e o retorno? Zero. Seu orçamento desaparece sem explicação.",
    },
    {
      emoji: "🤯",
      title: "Se perdeu em termos técnicos como CPC, CTR, SERP...",
      desc: "O marketing digital parece outro idioma. Você quer resultados, não um dicionário de siglas.",
    },
    {
      emoji: "😤",
      title: "Pagou uma agência e não entendeu nada do que fizeram",
      desc: "Relatórios confusos, métricas sem contexto e a sensação de estar refém de quem deveria te ajudar.",
    },
  ]

  return (
    <Section>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16 text-center"
      >
        <motion.div variants={fadeUp}>
          <GradientText as="h2" className="text-4xl font-bold sm:text-5xl">
            Você já se sentiu assim?
          </GradientText>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {pains.map((p) => (
            <motion.div key={p.title} variants={fadeUp}>
              <GlassCard className="flex h-full flex-col items-center gap-4 p-8 text-center">
                <span className="text-4xl">{p.emoji}</span>
                <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp}>
          <GradientText as="p" className="text-2xl font-semibold sm:text-3xl">
            O AdsUnify resolve tudo isso.
          </GradientText>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   3 — FEATURES
   ════════════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    { Icon: Brain, title: "Co-Piloto IA", desc: "Uma IA que conhece seu negócio e sugere ações personalizadas todos os dias" },
    { Icon: Target, title: "Missões Semanais", desc: "Aprenda marketing fazendo missões gamificadas. Ganhe XP e suba de nível" },
    { Icon: Search, title: "SEO Inteligente", desc: "Descubra as palavras-chave certas e monitore seu ranking no Google automaticamente" },
    { Icon: Eye, title: "Espião de Concorrentes", desc: "Saiba exatamente o que seus concorrentes estão fazendo e faça melhor" },
    { Icon: FileText, title: "Fábrica de Conteúdo", desc: "Artigos, posts, anúncios — tudo gerado por IA e otimizado para seu negócio" },
    { Icon: TrendingUp, title: "Previsão de Resultados", desc: "Simule investimentos e veja resultados estimados antes de gastar R$1" },
  ]

  return (
    <Section id="funcionalidades">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16 text-center"
      >
        <motion.div variants={fadeUp}>
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Tudo que você precisa.{" "}
            <GradientText as="span">Em um só lugar.</GradientText>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp}>
              <GlassCard className="flex h-full flex-col items-center gap-5 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 ring-1 ring-slate-200">
                  <Icon className="h-7 w-7 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   4 — HOW IT WORKS
   ════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    { num: "1", title: "Conte sobre seu negócio", desc: "Responda algumas perguntas simples e nossa IA vai entender seu mercado" },
    { num: "2", title: "Receba seu plano personalizado", desc: "Missões semanais, sugestões de conteúdo e estratégias sob medida" },
    { num: "3", title: "Veja seus resultados crescerem", desc: "Acompanhe sua evolução no dashboard e celebre cada conquista" },
  ]

  return (
    <Section>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-16 text-center"
      >
        <motion.div variants={fadeUp}>
          <GradientText as="h2" className="text-4xl font-bold sm:text-5xl">
            Simples como 1, 2, 3
          </GradientText>
        </motion.div>

        <div className="relative grid gap-12 sm:grid-cols-3 sm:gap-8">
          {/* connecting line (desktop) */}
          <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px sm:block">
            <div className="h-full w-full border-t-2 border-dashed border-violet-500/30" />
          </div>

          {steps.map((s) => (
            <motion.div key={s.num} variants={fadeUp} className="relative flex flex-col items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-600/20 ring-1 ring-slate-200">
                <GradientText as="span" className="text-3xl font-extrabold">
                  {s.num}
                </GradientText>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{s.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   5 — PRICING
   ════════════════════════════════════════════════════════════════════ */
function PricingSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 67,
      yearlyPrice: 670,
      tagline: "Para quem esta comecando",
      popular: false,
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
      id: "pro",
      name: "Pro",
      monthlyPrice: 197,
      yearlyPrice: 1970,
      tagline: "Para quem quer resultados serios",
      popular: true,
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
      id: "agencia",
      name: "Agencia",
      monthlyPrice: 397,
      yearlyPrice: 3970,
      tagline: "Para profissionais e agencias",
      popular: false,
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

  function getDisplayPrice(plan: (typeof plans)[number]) {
    if (isAnnual) return Math.round(plan.yearlyPrice / 12)
    return plan.monthlyPrice
  }

  return (
    <Section id="precos">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="flex flex-col items-center gap-12 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div variants={fadeUp}>
            <GradientText as="h2" className="text-4xl font-bold sm:text-5xl">
              Invista no seu crescimento
            </GradientText>
          </motion.div>
          <motion.p variants={fadeUp} className="max-w-xl text-slate-500">
            Escolha o plano ideal para o seu negocio. Todos os planos incluem
            7 dias gratis.
          </motion.p>

          {/* Billing toggle */}
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-slate-900" : "text-slate-400")}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn("relative h-7 w-14 rounded-full transition-colors", isAnnual ? "bg-violet-600" : "bg-slate-200")}
            >
              <motion.div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                animate={{ left: isAnnual ? 30 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-slate-900" : "text-slate-400")}>
              Anual{" "}
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                2 meses gratis
              </span>
            </span>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={cn(plan.popular && "lg:-mt-4 lg:mb-4")}
            >
              <GlassCard
                glow={plan.popular}
                className={cn(
                  "relative flex h-full flex-col items-center gap-6 p-8",
                  plan.popular && "border-violet-500/30 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] lg:scale-105"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.tagline}</p>

                {/* Price */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">R${getDisplayPrice(plan)}</span>
                    <span className="text-slate-400">/mes</span>
                  </div>
                  {isAnnual && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-slate-400">
                      cobrado <span className="text-emerald-400">R${plan.yearlyPrice.toLocaleString("pt-BR")}/ano</span>
                    </motion.p>
                  )}
                  {isAnnual && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-400 line-through">
                      R${plan.monthlyPrice}/mes
                    </motion.p>
                  )}
                </div>

                {/* Features */}
                <div className="w-full text-left">
                  {plan.inheritLabel && (
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {plan.inheritLabel}
                    </p>
                  )}
                  <ul className="flex flex-col gap-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-600">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto w-full pt-4">
                  <Link href="/precos">
                    <GlowButton
                      variant={plan.popular ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                    >
                      <span>Comecar Gratis</span>
                    </GlowButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Payment methods hint */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Cartao (Stripe)</span>
          <span className="flex items-center gap-1.5"><QrCode className="h-4 w-4" /> PIX (Asaas)</span>
          <span className="flex items-center gap-1.5"><Receipt className="h-4 w-4" /> Boleto (Asaas)</span>
        </motion.div>

        {/* Guarantee */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
          <Shield className="h-6 w-6 shrink-0 text-emerald-400" />
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-emerald-400">30 dias de garantia</span> — se nao estiver satisfeito, devolvemos 100% do seu dinheiro.
          </p>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   6 — CTA
   ════════════════════════════════════════════════════════════════════ */
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
        <motion.div variants={fadeUp}>
          <GlassCard
            hover={false}
            glow
            className="flex flex-col items-center gap-8 border-violet-500/20 p-12 text-center sm:p-16"
          >
            <GradientText as="h2" className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Pronto para dominar o marketing digital?
            </GradientText>
            <p className="max-w-xl text-lg text-slate-500">
              Junte-se a milhares de empreendedores que já transformaram seus
              resultados
            </p>
            <Link href="/registro">
              <GlowButton variant="primary" size="lg">
                Começar Grátis Agora <ArrowRight className="ml-1 h-4 w-4" />
              </GlowButton>
            </Link>
            <p className="text-sm text-slate-400">
              7 dias grátis. Sem compromisso.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   7 — FOOTER
   ════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <GradientText as="span" className="text-xl font-bold">
            AdsUnify
          </GradientText>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <a href="#funcionalidades" className="transition hover:text-slate-900">Funcionalidades</a>
          <a href="#precos" className="transition hover:text-slate-900">Preços</a>
          <span className="cursor-default text-slate-400" title="Em breve">Blog</span>
          <span className="cursor-default text-slate-400" title="Em breve">Suporte</span>
        </nav>

        <div className="flex items-center gap-4 text-slate-400">
          <a href="#" className="transition hover:text-slate-900"><Globe className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><Mail className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><ExternalLink className="h-5 w-5" /></a>
          <a href="#" className="transition hover:text-slate-900"><Link2 className="h-5 w-5" /></a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        © 2026 AdsUnify. Todos os direitos reservados.
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9fc] text-slate-900">
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  )
}
