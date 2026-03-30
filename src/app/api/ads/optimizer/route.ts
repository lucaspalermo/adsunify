import { NextResponse } from "next/server"
import { generateOptimizations } from "@/lib/services/ads-optimizer"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const suggestions = await generateOptimizations(userId)
  return NextResponse.json(suggestions)
}
