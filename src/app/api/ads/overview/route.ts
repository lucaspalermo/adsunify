import { NextResponse } from "next/server"
import { getAdsOverview } from "@/lib/services/ads-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const overview = await getAdsOverview(userId)
  return NextResponse.json(overview)
}
