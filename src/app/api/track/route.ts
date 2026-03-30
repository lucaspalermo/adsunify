import { NextResponse } from "next/server"
import { trackAction } from "@/lib/services/action-tracker"
import { db } from "@/lib/db"

async function resolveUserId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user) return user.id
  const fallback = await db.user.findFirst({ where: { email: "demo@adsunify.com" } })
  return fallback?.id || null
}

export async function POST(req: Request) {
  try {
    const { userId, action, metadata } = await req.json()
    const realId = await resolveUserId(userId || "demo")
    if (!realId) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const results = await trackAction(realId, action, metadata)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Track error:", error)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
