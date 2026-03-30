import { NextResponse } from "next/server"
import { scanOpportunities } from "@/lib/services/opportunity-radar"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const opportunities = await scanOpportunities(userId)

    return NextResponse.json({
      total: opportunities.length,
      highImpact: opportunities.filter((o) => o.impact === "alto").length,
      quickWins: opportunities.filter((o) => o.type === "quick_win").length,
      opportunities,
    })
  } catch (error) {
    console.error("Opportunity scan error:", error)
    return NextResponse.json({ error: "Failed to scan opportunities" }, { status: 500 })
  }
}
