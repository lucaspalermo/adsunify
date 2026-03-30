import { NextResponse } from "next/server"
import { getComparisonData } from "@/lib/services/competitor-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const competitorId = searchParams.get("competitorId")

  if (!userId || !competitorId) {
    return NextResponse.json({ error: "userId and competitorId required" }, { status: 400 })
  }

  try {
    const data = await getComparisonData(userId, competitorId)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
