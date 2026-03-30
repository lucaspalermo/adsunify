import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as unknown as { metadata?: { userId?: string; plan?: string }; subscription?: string }
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan

      if (userId && plan) {
        await db.user.update({
          where: { id: userId },
          data: {
            plan: plan as "STARTER" | "PRO" | "AGENCIA",
            stripeSubId: session.subscription as string,
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as unknown as { id: string; status: string; current_period_end: number }
      const user = await db.user.findFirst({ where: { stripeSubId: subscription.id } })
      if (user && subscription.status === "active") {
        await db.user.update({
          where: { id: user.id },
          data: { planExpiresAt: new Date(subscription.current_period_end * 1000) },
        })
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as unknown as { id: string }
      const user = await db.user.findFirst({ where: { stripeSubId: subscription.id } })
      if (user) {
        await db.user.update({
          where: { id: user.id },
          data: { plan: "STARTER", stripeSubId: null, planExpiresAt: null },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
