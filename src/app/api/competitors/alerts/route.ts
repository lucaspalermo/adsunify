import { NextResponse } from "next/server"
import { getCompetitorAlerts, markAlertRead } from "@/lib/services/competitor-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const alerts = await getCompetitorAlerts(userId)
  return NextResponse.json(alerts)
}

export async function POST(req: Request) {
  try {
    const { alertId } = await req.json()
    if (!alertId) return NextResponse.json({ error: "alertId required" }, { status: 400 })

    await markAlertRead(alertId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Alert error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
