import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    })
  }
  return _stripe
}

// Lazy-initialized stripe instance
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  STARTER: {
    name: "Starter",
    price: 6700, // R$67 in centavos
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    features: [
      "1 site monitorado",
      "10 conteudos IA por mes",
      "2 concorrentes",
      "Missoes semanais",
      "Co-Piloto IA",
      "Glossario completo",
    ],
    limits: {
      sites: 1,
      contentsPerMonth: 10,
      competitors: 2,
      funnelPages: 0,
      reports: 1,
    },
  },
  PRO: {
    name: "Pro",
    price: 19700, // R$197
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    popular: true,
    features: [
      "3 sites monitorados",
      "Conteudo IA ilimitado",
      "10 concorrentes",
      "Funil Builder (10 paginas)",
      "Relatorios PDF ilimitados",
      "Otimizador de anuncios",
      "Tudo do Starter",
    ],
    limits: {
      sites: 3,
      contentsPerMonth: -1, // unlimited
      competitors: 10,
      funnelPages: 10,
      reports: -1,
    },
  },
  AGENCIA: {
    name: "Agencia",
    price: 39700, // R$397
    priceId: process.env.STRIPE_AGENCIA_PRICE_ID || "",
    features: [
      "10 sites monitorados",
      "Tudo ilimitado",
      "Multi-clientes",
      "White-label",
      "CRM basico",
      "Propostas automaticas",
      "Suporte prioritario",
      "Tudo do Pro",
    ],
    limits: {
      sites: 10,
      contentsPerMonth: -1,
      competitors: -1,
      funnelPages: -1,
      reports: -1,
    },
  },
} as const

export type PlanKey = keyof typeof PLANS

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanKey]?.limits || PLANS.STARTER.limits
}

export function formatPrice(centavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100)
}
