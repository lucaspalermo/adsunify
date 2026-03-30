import { NextResponse } from "next/server"
import { runBasicSiteAudit, getLatestAudit } from "@/lib/services/seo-service"
import { db } from "@/lib/db"

async function resolveUserId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) return user.id
  const fallback = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  return fallback?.id || null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const realId = await resolveUserId(userId)
  if (!realId) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })

  const audit = await getLatestAudit(realId)
  return NextResponse.json(audit)
}

export async function POST(req: Request) {
  try {
    const { userId, url } = await req.json()
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

    const realId = await resolveUserId(userId || "demo")
    if (!realId) return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })

    const fullUrl = url.startsWith("http") ? url : `https://${url}`
    const result = await runBasicSiteAudit(realId, fullUrl)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Audit error:", error)
    return NextResponse.json({ error: "Erro ao auditar site" }, { status: 500 })
  }
}
