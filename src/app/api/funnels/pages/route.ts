import { NextResponse } from "next/server"
import { getFunnel, updateFunnelPage, addFunnelPage, deleteFunnelPage } from "@/lib/services/funnel-service"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const funnelId = searchParams.get("funnelId")
  if (!userId || !funnelId) return NextResponse.json({ error: "userId and funnelId required" }, { status: 400 })

  const funnel = await getFunnel(userId, funnelId)
  return NextResponse.json(funnel)
}

export async function POST(req: Request) {
  try {
    const { action, funnelId, pageId, name, type, blocks } = await req.json()

    if (action === "add" && funnelId) {
      const page = await addFunnelPage(funnelId, { name: name || "Nova Pagina", type: type || "landing" })
      return NextResponse.json(page)
    }

    if (action === "update" && pageId) {
      const page = await updateFunnelPage(pageId, { name, blocks })
      return NextResponse.json(page)
    }

    if (action === "delete" && pageId) {
      await deleteFunnelPage(pageId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Funnel page error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
