import { NextResponse } from "next/server"
import { predictBudget } from "@/lib/services/ads-optimizer"

export async function POST(req: Request) {
  try {
    const { monthlyBudget, niche, platform } = await req.json()

    if (!monthlyBudget || !niche) {
      return NextResponse.json({ error: "monthlyBudget and niche required" }, { status: 400 })
    }

    const prediction = await predictBudget({ monthlyBudget, niche, platform: platform || "BOTH" })
    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Predict error:", error)
    return NextResponse.json({ error: "Erro ao calcular previsao" }, { status: 500 })
  }
}
