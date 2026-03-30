"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useInView, AnimatePresence } from "framer-motion"
import {
  Check,
  ChevronDown,
  Shield,
  CreditCard,
  QrCode,
  Receipt,
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

/* ─── plan data ─── */
const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 67,
    yearlyPrice: 670,
    subtitle: "Para quem esta comecando",
    popular: false,
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
    subtitle: "Para quem quer resultados serios",
    popular: true,
    features: [
      "3 sites monitorados",
      "Conteudo IA ilimitado",
      "10 concorrentes",
      "Funil Builder (10 paginas)",
      "Relatorios PDF ilimitados",
      "Otimizador de anuncios",
    ],
    starterFeatures: [
      "1 site monitorado",
      "10 conteudos IA por mes",
      "2 concorrentes",
      "Missoes semanais",
      "Co-Piloto IA",
      "Glossario completo",
    ],
  },
  {
    id: "agencia",
    name: "Agencia",
    monthlyPrice: 397,
    yearlyPrice: 3970,
    subtitle: "Para profissionais e agencias",
    popular: false,
    features: [
      "10 sites monitorados",
      "Tudo ilimitado",
      "Multi-clientes",
      "White-label",
      "CRM basico",
      "Propostas automaticas",
      "Suporte prioritario",
    ],
    proFeatures: [
      "3 sites monitorados",
      "Conteudo IA ilimitado",
      "10 concorrentes",
      "Funil Builder (10 paginas)",
      "Relatorios PDF ilimitados",
      "Otimizador de anuncios",
    ],
  },
]

/* ─── FAQ data ─── */
const faqs = [
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim! Cancele quando quiser, sem multa.",
  },
  {
    q: "Como funciona o periodo gratis?",
    a: "Voce tem 7 dias para testar todas as funcionalidades. Se nao gostar, cancele sem pagar nada.",
  },
  {
    q: "Quais formas de pagamento?",
    a: "Cartao de credito (Stripe), PIX e Boleto (Asaas).",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim! Faca upgrade ou downgrade a qualquer momento.",
  },
  {
    q: "Preciso de cartao de credito para comecar?",
    a: "Nao! Voce pode pagar com PIX ou boleto.",
  },
]

/* ─── payment methods ─── */
type PaymentMethod = "stripe" | "pix" | "boleto"

const paymentMethods: { id: PaymentMethod; label: string; sublabel: string; Icon: typeof CreditCard }[] = [
  { id: "stripe", label: "Cartao", sublabel: "Stripe", Icon: CreditCard },
  { id: "pix", label: "PIX", sublabel: "Asaas", Icon: QrCode },
  { id: "boleto", label: "Boleto", sublabel: "Asaas", Icon: Receipt },
]

/* ─── FAQ item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="border-b border-slate-200 last:border-0"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-slate-900 sm:text-base">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-slate-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-slate-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function PrecosPage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const faqRef = useRef(null)
  const faqInView = useInView(faqRef, { once: true, margin: "-100px" })

  async function handleSelectPlan(planId: string) {
    setLoadingPlan(planId)

    // For now: if not logged in, redirect to /registro
    // In a real implementation, check session first
    const userId = null // placeholder

    if (!userId) {
      router.push("/registro")
      return
    }

    try {
      const endpoint =
        paymentMethod === "stripe"
          ? "/api/payments/stripe/checkout"
          : "/api/payments/asaas/checkout"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billing: isAnnual ? "yearly" : "monthly",
          paymentMethod,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Checkout error:", err)
    } finally {
      setLoadingPlan(null)
    }
  }

  function getPrice(plan: (typeof plans)[number]) {
    if (isAnnual) {
      const monthlyEquivalent = Math.round(plan.yearlyPrice / 12)
      return monthlyEquivalent
    }
    return plan.monthlyPrice
  }

  function getPriceLabel(plan: (typeof plans)[number]) {
    if (isAnnual) {
      return `R$${plan.yearlyPrice.toLocaleString("pt-BR")}/ano`
    }
    return "/mes"
  }

  return (
    <div className="relative overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={stagger}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div variants={fadeUp}>
              <GradientText as="h1" className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                Invista no seu crescimento
              </GradientText>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="max-w-xl text-lg text-slate-500"
            >
              Escolha o plano ideal para o seu negocio. Todos os planos incluem
              7 dias gratis.
            </motion.p>

            {/* ─── Billing toggle ─── */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  !isAnnual ? "text-slate-900" : "text-slate-400"
                )}
              >
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={cn(
                  "relative h-7 w-14 rounded-full transition-colors",
                  isAnnual ? "bg-violet-600" : "bg-slate-100"
                )}
              >
                <motion.div
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                  animate={{ left: isAnnual ? 30 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isAnnual ? "text-slate-900" : "text-slate-400"
                )}
              >
                Anual{" "}
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                  2 meses gratis
                </span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Pricing Cards ─── */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid gap-6 lg:grid-cols-3"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={cn(plan.popular && "lg:-mt-4 lg:mb-4")}
              >
                <GlassCard
                  glow={plan.popular}
                  hover={!plan.popular}
                  className={cn(
                    "relative flex h-full flex-col gap-6 p-8",
                    plan.popular &&
                      "border-violet-500/30 shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] lg:scale-105"
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
                      Mais Popular
                    </span>
                  )}

                  {/* Plan name & subtitle */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">
                        R${getPrice(plan)}
                      </span>
                      <span className="text-slate-400">/mes</span>
                    </div>
                    {isAnnual && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-slate-400"
                      >
                        cobrado{" "}
                        <span className="text-emerald-400">
                          R${plan.yearlyPrice.toLocaleString("pt-BR")}/ano
                        </span>
                      </motion.p>
                    )}
                    {isAnnual && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-400 line-through"
                      >
                        R${plan.monthlyPrice}/mes
                      </motion.p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    {/* Inherited features label */}
                    {plan.id === "pro" && (
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                        Tudo do Starter +
                      </p>
                    )}
                    {plan.id === "agencia" && (
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                        Tudo do Pro +
                      </p>
                    )}

                    <ul className="flex flex-col gap-3 text-sm">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-slate-600"
                        >
                          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <GlowButton
                      variant={plan.popular ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <span>Processando...</span>
                      ) : (
                        <span>Comecar Gratis</span>
                      )}
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* ─── Payment Method Selector ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <p className="text-sm text-slate-500">Pagar com:</p>
            <div className="flex items-center gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all",
                    paymentMethod === method.id
                      ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-600"
                  )}
                >
                  <method.Icon className="h-4 w-4" />
                  <span>{method.label}</span>
                  <span className="text-xs text-slate-400">
                    ({method.sublabel})
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            ref={faqRef}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            variants={stagger}
            className="flex flex-col gap-10"
          >
            <motion.div variants={fadeUp} className="text-center">
              <GradientText as="h2" className="text-3xl font-bold sm:text-4xl">
                Perguntas frequentes
              </GradientText>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GlassCard hover={false} className="divide-y divide-slate-200 px-6 sm:px-8">
                {faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Guarantee Section ─── */}
      <section className="relative pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <GlassCard
              hover={false}
              glow
              glowColor="rgba(16, 185, 129, 0.1)"
              className="flex items-center gap-4 border-emerald-500/20 px-8 py-6"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Shield className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  30 dias de garantia
                </h3>
                <p className="text-sm text-slate-500">
                  Se voce nao estiver satisfeito, devolvemos 100% do seu
                  dinheiro. Sem perguntas.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
