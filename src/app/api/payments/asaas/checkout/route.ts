import { NextResponse } from "next/server"
import { createAsaasCustomer, createAsaasSubscription, ASAAS_PLANS } from "@/lib/asaas"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId, plan, billingType, cpfCnpj } = await req.json()

    if (!userId || !plan || !ASAAS_PLANS[plan as keyof typeof ASAAS_PLANS]) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })

    // Create Asaas customer
    const customer = await createAsaasCustomer({
      name: (user.name || user.email) as string,
      email: user.email as string,
      cpfCnpj,
    })

    const selectedPlan = ASAAS_PLANS[plan as keyof typeof ASAAS_PLANS]

    // Create subscription
    const subscription = await createAsaasSubscription({
      customer: customer.id,
      value: selectedPlan.value,
      billingType: billingType || "PIX",
      description: selectedPlan.description,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    })
  } catch (error) {
    console.error("Asaas checkout error:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
