import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/configuracoes/plano`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Erro ao abrir portal" }, { status: 500 })
  }
}
