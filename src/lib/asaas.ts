const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ""

interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj?: string
}

interface AsaasSubscription {
  id: string
  customer: string
  value: number
  cycle: "MONTHLY" | "QUARTERLY" | "YEARLY"
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD"
  status: string
}

async function asaasFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erro na API Asaas" }))
    throw new Error(error.message || `Asaas API error: ${res.status}`)
  }

  return res.json()
}

export async function createAsaasCustomer(data: { name: string; email: string; cpfCnpj?: string }): Promise<AsaasCustomer> {
  return asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function createAsaasSubscription(data: {
  customer: string
  value: number
  cycle?: string
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD"
  description?: string
}): Promise<AsaasSubscription> {
  return asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      cycle: data.cycle || "MONTHLY",
      description: data.description || "Assinatura AdsUnify",
    }),
  })
}

export async function getAsaasSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return asaasFetch(`/subscriptions/${subscriptionId}`)
}

export async function cancelAsaasSubscription(subscriptionId: string) {
  return asaasFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" })
}

export async function getAsaasPaymentLink(data: {
  name: string
  value: number
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED"
  description?: string
  subscriptionCycle?: string
}) {
  return asaasFetch("/paymentLinks", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      chargeType: "RECURRENT",
      subscriptionCycle: data.subscriptionCycle || "MONTHLY",
      description: data.description || "Assinatura AdsUnify",
    }),
  })
}

export const ASAAS_PLANS = {
  STARTER: { value: 67, description: "AdsUnify Starter" },
  PRO: { value: 197, description: "AdsUnify Pro" },
  AGENCIA: { value: 397, description: "AdsUnify Agencia" },
} as const
