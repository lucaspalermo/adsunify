import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, payment } = body

    // Verify webhook token (Asaas sends it in header)
    const token = req.headers.get("asaas-access-token")
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Find user by Asaas subscription/customer
        if (payment?.subscription) {
          // Update user plan based on payment value
          let plan: "STARTER" | "PRO" | "AGENCIA" = "STARTER"
          if (payment.value >= 397) plan = "AGENCIA"
          else if (payment.value >= 197) plan = "PRO"

          // Find user - you would store asaas customer ID on user model
          // For now, log the event
          console.log(`Payment confirmed for subscription ${payment.subscription}, plan: ${plan}`)
        }
        break
      }

      case "PAYMENT_OVERDUE":
      case "PAYMENT_DELETED": {
        console.log(`Payment issue for subscription ${payment?.subscription}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Asaas webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
