import { NextResponse } from "next/server"
import { forecastRevenue, optimizeBudget, getHealthTrend, getAttributionData } from "@/lib/services/predictive-analytics"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const type = searchParams.get("type") || "all"

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    if (type === "revenue") {
      const forecast = await forecastRevenue(userId)
      return NextResponse.json({ forecast })
    }

    if (type === "budget") {
      const allocations = await optimizeBudget(userId)
      return NextResponse.json({ allocations })
    }

    if (type === "health") {
      const trend = await getHealthTrend(userId)
      return NextResponse.json({ trend })
    }

    if (type === "attribution") {
      const attribution = await getAttributionData(userId)
      return NextResponse.json(attribution)
    }

    // Return all
    const [forecast, allocations, trend, attribution] = await Promise.all([
      forecastRevenue(userId),
      optimizeBudget(userId),
      getHealthTrend(userId),
      getAttributionData(userId),
    ])

    return NextResponse.json({ forecast, allocations, trend, attribution })
  } catch (error) {
    console.error("Forecast error:", error)
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
  }
}
