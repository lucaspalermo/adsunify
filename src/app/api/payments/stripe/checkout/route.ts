import { NextResponse } from "next/server"
import { stripe, PLANS, PlanKey } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId, plan } = await req.json()

    if (!userId || !plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    const selectedPlan = PLANS[plan as PlanKey]

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/configuracoes/plano?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/precos?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Erro ao criar sessao de pagamento" }, { status: 500 })
  }
}
