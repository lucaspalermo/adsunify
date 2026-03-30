import { NextResponse } from "next/server"
import { createFunnel, getUserFunnels, updateFunnel, deleteFunnel } from "@/lib/services/funnel-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const funnels = await getUserFunnels(userId)
  return NextResponse.json(funnels)
}

export async function POST(req: Request) {
  try {
    const { userId, name, templateId, action, funnelId, data } = await req.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    if (action === "delete" && funnelId) {
      await deleteFunnel(userId, funnelId)
      return NextResponse.json({ success: true })
    }

    if (action === "update" && funnelId && data) {
      const funnel = await updateFunnel(userId, funnelId, data)
      return NextResponse.json(funnel)
    }

    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const funnel = await createFunnel(userId, { name, templateId })
    return NextResponse.json(funnel)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
